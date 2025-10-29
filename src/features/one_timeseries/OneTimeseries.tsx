import { useState } from "react";
import Sheet from "@mui/joy/Sheet";
import Grid from "@mui/joy/Grid";
import Typography from "@mui/joy/Typography";
import Link from "@mui/joy/Link";
import "./OneTimeseries.css";
import GoogleTSChart from "../google_ts_chart/GoogleTSChart";
import ChartJSChart from "../chart_js_chart/ChartJSChart";
import TSMetadata from "../ts_metadata/TSMetadata";
import MetricValuesList from "../metric_values_list/MetricValuesList";
import { useSelector } from "react-redux";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useColorScheme } from "@mui/joy/styles";

import Loading from "../loading/Loading";
import {
  useWindowDimensions,
  isScreenSmall,
  FRED_DATA_SOURCE_UID,
  BASE_FRED_LINK,
} from "../../utils/utils";

import { selectUnaryMetrics } from "../../redux/metricsSlice";
import { selectMetric } from "../../redux/tsFiltersSlice";

import {
  ChartopEntry,
  SingleTimeseriesMetadataMetric,
} from "../../types/timeseries";
import { Metric } from "../../types/metrics";

function getCitationJSX(entry: ChartopEntry) {
  const linksJSX = [];
  for (let i = 0; i < entry.operands.length; ++i) {
    const operand = entry.operands[i];
    const source: string = operand.metadata.source_uid;
    if (source === FRED_DATA_SOURCE_UID) {
      const uidFromSource: string = operand.metadata.uid_from_source;
      const fredHref = `${BASE_FRED_LINK}/${uidFromSource}`;
      linksJSX.push(
        <Typography key={i}>
          <Link href={fredHref}>{fredHref}</Link>
          {i < entry.operands.length - 1 ? " and " : ""}
        </Typography>,
      );
    }
  }

  if (linksJSX.length > 0) {
    return (
      <Grid
        padding={0.5}
        margin={0.5}
        sx={(theme) => {
          return {
            // @ts-ignore
            bgcolor: theme.colorSchemes["light"].tagBackgroundColor,
            borderRadius: 7,
            border: 1,
            borderColor: "#ff9d25",
          };
        }}
      >
        <Typography
          sx={{ color: "black", wordBreak: "break-word" }}
          noWrap={false}
        >
          <Typography
            noWrap={false}
            fontWeight="xl"
            sx={{ wordBreak: "break-word" }}
          >
            Citation:{" "}
          </Typography>
          This data was obtained from the Federal Reserve FRED database. Visit{" "}
          {linksJSX} for the original source.
        </Typography>
      </Grid>
    );
  }
}

function getAllMetricsJSX(
  entry: ChartopEntry,
  metrics: Array<Metric>,
  accordion = false,
  mode = "light",
) {
  return (
    <MetricValuesList
      entry={entry}
      metrics={metrics}
      accordion={accordion}
      mode={mode}
    />
  );
  // const titleJSX = (
  // 	<Grid key="title" sx={{borderBottom: accordion?0:1, borderColor: "#ff9d25"}}>
  // 		<Typography sx={{wordBreak: "break-word"}} noWrap={false} startDecorator={<AssessmentIcon sx={{color:"#ff9d25"}}/>} component="span" level="h2">Metrics</Typography>
  // 	</Grid>
  // );

  // LIST
  // for (const tsToMetric of ts.metadata.metrics) {
  // 	jsx.push(
  // 		<Grid key={tsToMetric.uid}>
  // 			<Grid container={1} direction="row" spacing={1} justifyContent="space-between">
  // 				<Grid xs={9}>
  // 					<Typography component="p">{uidToMetric[tsToMetric.uid].name}</Typography>
  // 				</Grid>
  // 				<Grid xs={3} sx={{paddingRight: 1}}>
  // 					<Typography component="p" sx={{color: tsToMetric.color}}>{tsToMetric.formattedValue}</Typography>
  // 				</Grid>
  // 			</Grid>
  // 		</Grid>
  // 	);
  // }

  // OLD LIST
  // for (let i = 0; i < 100; ++i) {
  // 	jsx.push(
  // 		<Grid key={i+100}>
  // 			<Grid container={1} direction="row" spacing={1} justifyContent="space-between">
  // 				<Grid xs={9}>
  // 					<Typography component="p">{uidToMetric[ts.metadata.metrics[0].uid].name + ": "}</Typography>
  // 				</Grid>
  // 				<Grid xs={3}>
  // 					<Typography component="p">{ts.metadata.metrics[0].formattedValue}</Typography>
  // 				</Grid>
  // 			</Grid>
  // 		</Grid>);
  // }

  // const tsUidToMetrics: {[key: number]: {[key: number]: SingleTimeseriesMetadataMetric}} = {};
  // for (const operand of entry.operands) {
  // 	tsUidToMetrics[operand.metadata.uid] = Object.fromEntries(
  // 		operand.metadata.metrics.map(metric => [metric.uid, metric] )
  // 	);
  // }

  // const tableHeadJSX = (entry.operands.length <= 1)?(<thead></thead>):(
  // 	<thead>
  // 		<tr>
  // 		<th style={{ width: '60%'}}></th>
  // 		{entry.operands.map((operand) => (
  // 			<th key={operand.metadata.uid} style={{ whiteSpace: "pre-wrap" }}><Typography>{operand.metadata.name}</Typography>
  // 			</th>))}
  // 		</tr>
  // 	</thead>
  // );

  // TABLE
  // const tableJSX = (
  // <Table hoverRow key="table" sx={{ '& tr > *:not(:first-child)': { textAlign: 'right' } }}>
  // {tableHeadJSX}
  // 	<tbody>
  // 	{
  // 		metrics.map( (metric) => {
  // 			const values: Array<string | null> = Array();
  // 			for (const operand of entry.operands) {
  // 				if (tsUidToMetrics[operand.metadata.uid][metric.uid]) {
  // 					values.push(tsUidToMetrics[operand.metadata.uid][metric.uid]);
  // 				}
  // 			}
  // 			if (!values.length) {
  // 				return;
  // 			}
  // 			return (
  // 			<tr key={metric.uid}>
  // 				<th style={{ whiteSpace: "pre-wrap" }}>{metric.name}</th>
  // 				{
  // 					values.map((value, i) => {
  // 						if (!value) {
  // 							return;
  // 						}
  // 						return (
  // 							<td key={metric.uid + entry.operands[i].metadata.uid} style={{ whiteSpace: "pre-wrap" }}>
  // 							<Typography sx={(theme)=> {
  // 									// @ts-ignore
  // 									return {
  // 										color: theme.colorSchemes[mode].metricValue[value.color]
  // 									}
  // 								}
  // 							}>
  // 							{value.formattedValue}
  // 								</Typography>
  // 							</td>
  // 						);
  // 					})
  // 				}
  // 			</tr>
  // 			);
  // 		}
  // 		)
  // 	}
  // 	</tbody>
  // </Table>);

  // 	if (accordion) {
  // 		return (
  // 		<AccordionGroup size="lg" transition={{
  //   initial: "0.3s ease-out",
  //   expanded: "0.3s ease",
  // }}>
  // 			<Accordion variant="plain">
  // 				<AccordionSummary sx={{borderTop: 1, borderColor: "#ff9d25"}}>{titleJSX}</AccordionSummary>
  // 				<AccordionDetails>{tableJSX}</AccordionDetails>
  // 			</Accordion>
  // 		</AccordionGroup>);
  // 	}
  // 	return [titleJSX, tableJSX];
}

function OneTimeseries({
  entry,
  index,
}: {
  entry: ChartopEntry;
  index: number;
}) {
  const { height, width } = useWindowDimensions();
  const unaryMetrics = useSelector(selectUnaryMetrics);
  const selectedMetric = useSelector(selectMetric);
  if (!selectedMetric) {
    return <></>;
  }
  const [isChartReady, setIsChartReady] = useState(false);
  const theme: { colorSchemes: Record<string, any> } = useTheme();
  // @ts-ignore
  const h1Title = useMediaQuery(theme.breakpoints.up("md"));
  // @ts-ignore
  const { mode }: { mode: string } = useColorScheme();
  const smallScreen: boolean = isScreenSmall(width, height);

  const accordionMetrics = width < 1024;

  const beforeChartJSX = [];
  for (let i = 0; i < entry.operands.length; ++i) {
    const ts = entry.operands[i];
    const legendSquareColor =
      entry.operands.length === 1 ? undefined : i === 0 ? "blue" : "red";
    beforeChartJSX.push(
      <TSMetadata
        legendSquareColor={legendSquareColor}
        key={ts.metadata.uid}
        ts={ts}
      />,
    );
  }
  const ts = entry.operands[0];
  const allMetricsJSX = getAllMetricsJSX(
    entry,
    unaryMetrics,
    accordionMetrics,
    mode,
  );

  let selectedTSToMetric = (ts.metadata.metrics || []).find(
    (metric: SingleTimeseriesMetadataMetric) =>
      metric.uid === selectedMetric.uid,
  );
  if (!selectedTSToMetric) {
    selectedTSToMetric = {
      uid: selectedMetric.uid,
      value: entry.order_by_metric_value,
      formattedValue: entry.formattedValue,
      color: entry.color,
    };
  }
  return (
    <Grid
      container={true}
      direction="row"
      spacing={2}
      columns={12}
      justifyContent="space-between"
    >
      {/*Info and chart to the left*/}
      <Grid xs={accordionMetrics ? 12 : 8}>
        <Sheet sx={{ border: 2, borderColor: "#ff9d25", borderRadius: 7 }}>
          <Grid container={true} direction="column">
            <Grid>
              {/*necesar*/}
              <Grid
                container={true}
                direction="row"
                spacing={0}
                justifyContent="space-between"
                sx={{ p: 2 }}
                alignItems="flex-start"
              >
                <Grid xs={8}>
                  <Typography
                    level="h2"
                    component="span"
                    sx={{ wordBreak: "break-word" }}
                    noWrap={false}
                  >
                    <Typography
                      level="h1"
                      component="span"
                      sx={{ wordBreak: "break-word" }}
                      noWrap={false}
                    >
                      {(index + 1).toString() + ". "}
                    </Typography>
                    {selectedMetric.name + ": "}{" "}
                  </Typography>
                </Grid>

                <Grid xs={4}>
                  <Typography
                    level={h1Title ? "h1" : "h2"}
                    component="span"
                    noWrap={false}
                    sx={(theme) => {
                      return {
                        wordBreak: "break-word",
                        // @ts-ignore
                        color:
                          theme.colorSchemes[mode].metricValue[
                            selectedTSToMetric.color
                          ],
                      };
                    }}
                  >
                    {selectedTSToMetric.formattedValue}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {beforeChartJSX}

            {/*Chart*/}
            <Grid>
              {smallScreen ? (
                <ChartJSChart entry={entry} width="100%" height="250vh" />
              ) : (
                <GoogleTSChart
                  entry={entry}
                  width="100%"
                  height="32em"
                  onChartReady={() => {
                    setIsChartReady(true);
                  }}
                />
              )}
              {!smallScreen && !isChartReady && (
                <Loading
                  message="Building Chart"
                  circularProgress={!smallScreen}
                  border={0}
                />
              )}
            </Grid>
            {getCitationJSX(entry)}
          </Grid>

          {/*Inside and below metrics*/}
          {accordionMetrics && (
            <Grid sx={{ maxHeight: "30em", overflowY: "scroll" }}>
              <Grid
                container={true}
                direction="column"
                spacing={1}
                disableEqualOverflow={true}
                sx={{ paddingRight: 0, paddingLeft: 1, paddingTop: 1 }}
              >
                {allMetricsJSX}
              </Grid>
            </Grid>
          )}
        </Sheet>
      </Grid>

      {/*Metrics to the right*/}
      {!accordionMetrics && (
        <Grid xs={4}>
          <Sheet
            sx={{
              border: 2,
              maxHeight: "50em",
              overflowY: "scroll",
              borderColor: "#ff9d25",
              borderRadius: 7,
            }}
          >
            <Grid
              container={true}
              direction="column"
              spacing={1}
              disableEqualOverflow={true}
              sx={{ paddingRight: 0, paddingLeft: 1, paddingTop: 1 }}
            >
              {allMetricsJSX}
            </Grid>
          </Sheet>
        </Grid>
      )}
    </Grid>
  );
}

export default OneTimeseries;
