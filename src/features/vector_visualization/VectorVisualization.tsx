import Grid from "@mui/joy/Grid";
import Sheet from "@mui/joy/Sheet";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { selectMetricsStatus, fetchMetrics } from "../../redux/metricsSlice";
import VectorVisualizationChart from "../vector_visualization_chart/VectorVisualizationChart";
import VectorVisualizationStack from "../vector_visualization_stack/VectorVisualizationStack";
import { useWindowDimensions } from "../../utils/utils";
import { selectTagsStatus, fetchTags } from "../../redux/tagsSlice";
import Loading from "../loading/Loading";
import AppError from "../errors/AppError";

function VectorVisualization() {
  const { height, width } = useWindowDimensions();
  const dispatch = useDispatch<AppDispatch>();
  const tagsStatus = useSelector(selectTagsStatus);
  const metricsStatus = useSelector(selectMetricsStatus);
  useEffect(() => {
    if (tagsStatus === "initial") {
      dispatch(fetchTags());
    }
  }, [dispatch, tagsStatus]);

  useEffect(() => {
    if (metricsStatus === "initial") {
      dispatch(fetchMetrics());
    }
  }, [dispatch, metricsStatus]);

  let contentJSX = undefined;
  if (tagsStatus === "error") {
    contentJSX = <AppError message="Failed to fetch tags ..." />;
  } else if (metricsStatus === "error") {
    contentJSX = <AppError message="Failed to fetch metrics ..." />;
  } else if (tagsStatus === "loading" || metricsStatus === "loading") {
    contentJSX = <Loading message="Fetching tags and metrics ..." />;
  } else if (tagsStatus === "initial" || metricsStatus === "initial") {
    contentJSX = <Loading message="Fetching tags and metrics ..." />;
  } else if (tagsStatus === "success" || metricsStatus === "success") {
    const chartSide: number = Math.floor(Math.min(height, width) / 1.5);
    contentJSX = (
      <>
        <Grid sx={{ width: chartSide }}>
          <Sheet
            sx={{
              paddingX: 0.5,
              border: 2,
              borderColor: "#ff9d25",
              borderRadius: 7,
            }}
          >
            <VectorVisualizationChart width={chartSide} height={chartSide} />
          </Sheet>
        </Grid>
        <VectorVisualizationStack width={width} />
      </>
    );
  } else {
    contentJSX = <AppError message="Unknown error ..." />;
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      spacing={0} // this makes the page go out of bounds ...
      mt={5}
      px={0.5}
      direction="column"
    >
      {contentJSX}
    </Grid>
  );
}

export default VectorVisualization;
