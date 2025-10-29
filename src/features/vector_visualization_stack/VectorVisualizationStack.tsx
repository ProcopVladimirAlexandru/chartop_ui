import Grid from "@mui/joy/Grid";
import Sheet from "@mui/joy/Sheet";
import ChartJSChart from "../chart_js_chart/ChartJSChart";
import MetricValuesList from "../metric_values_list/MetricValuesList";

import { useSelector } from "react-redux";
import { useColorScheme } from "@mui/joy/styles";
import { selectSelectedVVs } from "../../redux/visualizationVectorsSlice";
import { selectUnaryMetrics } from "../../redux/metricsSlice";
import TSMetadata from "../ts_metadata/TSMetadata";

function VectorVisualizationStack({ width }: { width: number }) {
  const { mode } = useColorScheme();
  const selectedVVs = useSelector(selectSelectedVVs);
  const unaryMetrics = useSelector(selectUnaryMetrics);

  if (!selectedVVs) {
    return <></>;
  }

  const chartsJSX = [];
  for (const vv of selectedVVs) {
    chartsJSX.push(
      <Grid
        key={vv.metadata.uid}
        sx={{ paddingTop: 5, width: Math.floor(0.8 * width) }}
      >
        <Sheet
          sx={{
            paddingX: 0.5,
            border: 2,
            borderColor: "#ff9d25",
            borderRadius: 7,
          }}
        >
          <TSMetadata ts={vv} />
          <Grid>
            <ChartJSChart
              entry={{
                operands: [vv],
              }}
              width="100%"
              height={"px"}
              unit="day"
            />
          </Grid>
          <MetricValuesList
            entry={{
              operands: [vv],
            }}
            metrics={unaryMetrics}
            accordion={true}
            mode={mode}
          />
        </Sheet>
      </Grid>,
    );
  }
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      spacing={0} // this makes the page go out of bounds ...
      mt={2}
      direction="column"
    >
      {chartsJSX}
    </Grid>
  );
}

export default VectorVisualizationStack;
