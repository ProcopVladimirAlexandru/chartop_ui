import Grid from "@mui/joy/Grid";
import Typography from "@mui/joy/Typography";
import Table from "@mui/joy/Table";
import {
  ChartableEntry,
  SingleTimeseriesMetadataMetric,
} from "../../types/timeseries";
import { Metric } from "../../types/metrics";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccordionGroup from "@mui/joy/AccordionGroup";
import Accordion from "@mui/joy/Accordion";
import AccordionSummary from "@mui/joy/AccordionSummary";
import AccordionDetails from "@mui/joy/AccordionDetails";

function MetricValuesList({
  entry,
  metrics,
  accordion = false,
  mode = "light",
}: {
  entry: ChartableEntry;
  metrics: Array<Metric>;
  accordion: boolean;
  mode?: string;
}) {
  const titleJSX = (
    <Grid
      key="title"
      sx={{ borderBottom: accordion ? 0 : 1, borderColor: "#ff9d25" }}
    >
      <Typography
        sx={{ wordBreak: "break-word" }}
        noWrap={false}
        startDecorator={<AssessmentIcon sx={{ color: "#ff9d25" }} />}
        component="span"
        level="h2"
      >
        Metrics
      </Typography>
    </Grid>
  );

  const tsUidToMetrics: {
    [key: number]: { [key: number]: SingleTimeseriesMetadataMetric };
  } = {};
  for (const operand of entry.operands) {
    tsUidToMetrics[operand.metadata.uid] = Object.fromEntries(
      (operand.metadata.metrics || []).map(
        (metric: SingleTimeseriesMetadataMetric) => [metric.uid, metric],
      ),
    );
  }

  const tableHeadJSX =
    entry.operands.length <= 1 ? (
      <thead></thead>
    ) : (
      <thead>
        <tr>
          <th style={{ width: "60%" }}></th>
          {entry.operands.map((operand) => (
            <th key={operand.metadata.uid} style={{ whiteSpace: "pre-wrap" }}>
              <Typography>{operand.metadata.name}</Typography>
            </th>
          ))}
        </tr>
      </thead>
    );

  // TABLE
  const tableJSX = (
    <Table
      hoverRow
      key="table"
      sx={{ "& tr > *:not(:first-child)": { textAlign: "right" } }}
    >
      {tableHeadJSX}
      <tbody>
        {metrics.map((metric) => {
          const values: Array<SingleTimeseriesMetadataMetric> = [];
          for (const operand of entry.operands) {
            if (tsUidToMetrics[operand.metadata.uid][metric.uid]) {
              values.push(tsUidToMetrics[operand.metadata.uid][metric.uid]);
            }
          }
          if (!values.length) {
            return;
          }
          return (
            <tr key={metric.uid}>
              <th style={{ whiteSpace: "pre-wrap" }}>{metric.name}</th>
              {values.map((value, i) => {
                if (!value) {
                  return;
                }
                return (
                  <td
                    key={metric.uid + entry.operands[i].metadata.uid}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    <Typography
                      sx={(theme) => {
                        return {
                          // @ts-ignore
                          color:
                            theme.colorSchemes[mode].metricValue[value.color],
                        };
                      }}
                    >
                      {value.formattedValue}
                    </Typography>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );

  if (accordion) {
    return (
      <AccordionGroup
        size="lg"
        transition={{
          initial: "0.3s ease-out",
          expanded: "0.3s ease",
        }}
      >
        <Accordion variant="plain">
          <AccordionSummary sx={{ borderTop: 1, borderColor: "#ff9d25" }}>
            {titleJSX}
          </AccordionSummary>
          <AccordionDetails>{tableJSX}</AccordionDetails>
        </Accordion>
      </AccordionGroup>
    );
  }
  return [titleJSX, tableJSX];
}

export default MetricValuesList;

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
