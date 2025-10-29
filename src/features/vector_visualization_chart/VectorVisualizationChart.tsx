import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  selectPreviousOriginTSUid,
  selectVisualizationVectorsStatus,
  selectCoordinates,
  setCoordinates,
  setPreviousOriginTSUid,
  selectAllVVs,
  fetchTSWithVisualizationVectors,
  selectVV,
} from "../../redux/visualizationVectorsSlice";
import {
  MAXIMUM_VECTORS,
  DEFAULT_AXIS_DOMAIN_LENGTH,
  DEFAULT_X_MIN,
  DEFAULT_Y_MIN,
  DEFAULT_ORIGIN_VECTOR,
} from "../../utils/utils";
import { ChartDatum } from "../../types/visualizationVectors";
import { useWindowDimensions, isScreenSmall } from "../../utils/utils";
import { useTheme } from "@mui/material/styles";
import { useColorScheme } from "@mui/joy/styles";

import * as d3 from "d3";
import { useSearchParams } from "react-router";

const SQRT_2_HALF: number = Math.sqrt(2) / 2;
const DEFAULT_LIMIT: number = 25;

function VectorVisualizationChart({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const theme: { colorSchemes: Record<string, any> } = useTheme();
  const { mode } = useColorScheme();
  const svgRef = useRef(null);
  const gDotRef =
    useRef<Selection<HTMLDivElement, unknown, HTMLElement, any>>(undefined);
  const xRef = useRef<d3.ScaleLinear<number, number, number> | null>(null);
  const yRef = useRef<d3.ScaleLinear<number, number, number> | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const allVVs = useSelector(selectAllVVs);
  const coordinates = useSelector(selectCoordinates);
  const vvStatus = useSelector(selectVisualizationVectorsStatus);
  const previousOriginTSUid = useSelector(selectPreviousOriginTSUid);
  const tooltipRef =
    useRef<Selection<HTMLDivElement, unknown, HTMLElement, any>>(undefined);
  const vvStatusRef = useRef(vvStatus);
  const [searchParams] = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  const [chartRendered, setChartRendered] = useState(false);
  const chartRenderedRef = useRef(false);
  const windowDimensions = useWindowDimensions();
  const smallScreen: boolean = isScreenSmall(
    windowDimensions.width,
    windowDimensions.height,
  );
  const smallScreenRef = useRef(smallScreen);

  useEffect(() => {
    if (vvStatus === "loading" || vvStatus === "error") {
      return;
    }
    let originTSUid = undefined;
    let originVector = undefined;
    const searchTSUid = searchParams.get("ts_uid");
    if (searchTSUid) {
      originTSUid = Number(searchTSUid);
    } else {
      originVector = DEFAULT_ORIGIN_VECTOR;
    }
    if (vvStatus === "initial" || (originTSUid || 0) !== previousOriginTSUid) {
      dispatch(
        fetchTSWithVisualizationVectors({
          radius: SQRT_2_HALF * DEFAULT_AXIS_DOMAIN_LENGTH,
          originTSUid: originTSUid,
          originVector: originVector,
          limit: MAXIMUM_VECTORS,
        }),
      );
      dispatch(setPreviousOriginTSUid(originTSUid || 0));
    }
  }, [searchParams, vvStatus, previousOriginTSUid, setPreviousOriginTSUid]);

  useEffect(() => {
    if (chartRenderedRef.current) {
      return;
    }
    if (vvStatus !== "success") {
      return;
    }
    const searchTSUid = Number(searchParams.get("ts_uid") || 0);
    if (
      previousOriginTSUid === undefined ||
      searchTSUid !== previousOriginTSUid ||
      !coordinates
    ) {
      return;
    }
    const k = width / height;
    const chartData: Array<ChartDatum> = [];

    const tickCount: number = 5;
    const svgElement = d3.select(svgRef.current);
    let timer: number | undefined = undefined;

    function zoomed({ transform }: { transform: d3.ZoomTransform }) {
      const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
      const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
      const strokeFactor = smallScreenRef.current ? 10 : 15;
      gDot
        .attr("transform", transform)
        .attr("stroke-width", strokeFactor / transform.k);
      gx.call(xAxis, zx);
      gy.call(yAxis, zy);
      gGrid.call(grid, zx, zy);

      const x0R =
        (-transform.x / transform.k) * (axisDomainLength / width) + xMin;
      const y0R =
        -((-transform.y / transform.k) * (axisDomainLength / width)) +
        yMin +
        axisDomainLength;

      const xCR =
        ((width - transform.x) / transform.k) * (axisDomainLength / width) +
        xMin;
      const yCR =
        -(((width - transform.y) / transform.k) * (axisDomainLength / width)) +
        yMin +
        axisDomainLength;

      const radius = Math.abs(xCR - x0R) * SQRT_2_HALF;
      const xO = x0R + (xCR - x0R) / 2;
      const yO = y0R - (y0R - yCR) / 2;
      dispatch(
        setCoordinates({
          xMin: x0R,
          yMin: yCR,
          axisDomainLength: xCR - x0R,
        }),
      );

      clearTimeout(timer);
      timer = setTimeout(() => {
        dispatch(
          fetchTSWithVisualizationVectors({
            originVector: [xO, yO],
            radius: radius,
            limit: DEFAULT_LIMIT,
          }),
        );
      }, 1000);
    }

    const axisDomainLength: number =
      coordinates.axisDomainLength || DEFAULT_AXIS_DOMAIN_LENGTH;
    const xMin: number = coordinates.xMin || DEFAULT_X_MIN;
    const yMin: number = coordinates.yMin || DEFAULT_Y_MIN;

    const zoom = d3.zoom().scaleExtent([0.1, 1000]).on("zoom", zoomed);

    const x = d3
      .scaleLinear()
      .domain([xMin, xMin + axisDomainLength])
      .range([0, width]);
    xRef.current = x;

    const y = d3
      .scaleLinear()
      .domain([yMin * k, (yMin + axisDomainLength) * k])
      .range([height, 0]);
    yRef.current = y;

    const xAxis = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      x: d3.AxisScale<number>,
    ) =>
      g
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisTop(x).ticks(tickCount))
        .call((g) => g.select(".domain").attr("display", "none"));

    const yAxis = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      y: d3.AxisScale<number>,
    ) =>
      g
        .call(d3.axisRight(y).ticks(tickCount * k))
        .call((g) => g.select(".domain").attr("display", "none"));

    const grid = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      x: d3.AxisScale<number>,
      y: d3.AxisScale<number>,
    ) =>
      g
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1)
        .call((g) =>
          g
            .selectAll(".x")
            .data(x.ticks(tickCount))
            .join(
              (enter) =>
                enter.append("line").attr("class", "x").attr("y2", height),
              (update) => update,
              (exit) => exit.remove(),
            )
            .attr("x1", (d) => 0.5 + x(d))
            .attr("x2", (d) => 0.5 + x(d)),
        )
        .call((g) =>
          g
            .selectAll(".y")
            .data(y.ticks(tickCount * k))
            .join(
              (enter) =>
                enter.append("line").attr("class", "y").attr("x2", width),
              (update) => update,
              (exit) => exit.remove(),
            )
            .attr("y1", (d) => 0.5 + y(d))
            .attr("y2", (d) => 0.5 + y(d)),
        );

    svgElement.attr("viewBox", [0, 0, width, height]);
    const gGrid = svgElement.append("g");
    const gDot = svgElement
      .append("g")
      .attr("fill", "none")
      .attr("stroke-linecap", "round");
    gDotRef.current = gDot;

    tooltipRef.current = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("background-color", "black")
      .style("color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "3px")
      .style("position", "absolute");

    const gx = svgElement.append("g");

    const gy = svgElement.append("g");

    svgElement.call(zoom).call(zoom.transform, d3.zoomIdentity);
    chartRenderedRef.current = true;
    setChartRendered(true);
    return () => {
      // TODO uncomment
      // d3.select(svgRef.current).remove()
      // setChartRendered(false)
    };
  }, [
    svgRef,
    dispatch,
    coordinates,
    previousOriginTSUid,
    searchParams,
    vvStatus,
    setChartRendered,
    smallScreenRef,
  ]);

  useEffect(() => {
    if (!xRef.current || !yRef.current) {
      return;
    }
    if (!chartRendered || !allVVs || !allVVs.length) {
      return;
    }

    const chartData: Array<ChartDatum> = [];
    for (let i = 0; i < allVVs.length; ++i) {
      chartData.push({
        vector: [
          allVVs[i].visualization_vector[0],
          allVVs[i].visualization_vector[1],
          0.0,
        ],
        index: i,
        uid: allVVs[i].metadata.uid,
      });
    }

    const mouseover = function (_event: PointerEvent, d: ChartDatum) {
      if (!tooltipRef.current) {
        return;
      }
      tooltipRef.current.style("visibility", "visible").style("opacity", 1);
    };

    const mousemove = function (event: PointerEvent, d: ChartDatum) {
      if (!tooltipRef.current) {
        return;
      }
      const vv = allVVs[d.index];
      const [x, y] = [event.screenX, event.screenY];
      tooltipRef.current
        .style("left", `${Math.floor(x)}px`) // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", `${Math.floor(y)}px`)
        .html(`${vv.metadata.name}`);
    };

    const mouseleave = function (_event: PointerEvent) {
      if (!tooltipRef.current) {
        return;
      }
      tooltipRef.current.transition().style("visibility", "hidden");
    };

    const searchTSUid = searchParamsRef.current.get("ts_uid")
      ? Number(searchParams.get("ts_uid"))
      : undefined;
    gDotRef.current.selectAll("path").remove();
    gDotRef.current
      .selectAll("circle")
      .data(chartData)
      .join("path")
      .attr(
        "d",
        (d: ChartDatum) =>
          `M${xRef.current ? xRef.current(d.vector[0]) : 0},${yRef.current ? yRef.current(d.vector[1]) : 0}h0`,
      )
      .attr("stroke", (d: ChartDatum) => {
        if (!searchTSUid) {
          return theme.colorSchemes[mode].visualizationVectors.dot.color.main;
        }
        if (searchTSUid === d.uid) {
          return theme.colorSchemes[mode].visualizationVectors.dot.color.target;
        }
        return theme.colorSchemes[mode].visualizationVectors.dot.color.main;
      })
      .on("click", function (_event: PointerEvent, d: ChartDatum) {
        if (smallScreenRef.current) {
          mouseover(_event, d);
          mousemove(_event, d);
        }
        dispatch(selectVV(allVVs[d.index]));
      })
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .style("cursor", "pointer");

    return () => {
      if (!tooltipRef.current) {
        return;
      }
      tooltipRef.current.transition().duration(200).style("opacity", 0);
    };

    vvStatusRef.current = vvStatus;
  }, [
    allVVs,
    tooltipRef,
    gDotRef,
    xRef,
    yRef,
    selectVV,
    chartRendered,
    smallScreenRef,
    searchParamsRef,
  ]);

  return <svg ref={svgRef}></svg>;
}

export default VectorVisualizationChart;
