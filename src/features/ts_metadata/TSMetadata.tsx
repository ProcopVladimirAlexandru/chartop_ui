import Grid from "@mui/joy/Grid";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import Button from "@mui/joy/Button";
import { useTheme } from "@mui/material/styles";
import { selectAllTags } from "../../redux/tagsSlice";
import { Tag } from "../../types/tags";
import { SingleTimeseries } from "../../types/timeseries";
import { useSelector } from "react-redux";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useColorScheme } from "@mui/joy/styles";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { Link } from "react-router";

function TSMetadata({
  ts,
  legendSquareColor,
}: {
  ts: SingleTimeseries;
  legendSquareColor?: string;
}) {
  const theme: { colorSchemes: Record<string, any> } = useTheme();
  const { mode } = useColorScheme();
  // @ts-ignore
  const h1Title = useMediaQuery(theme.breakpoints.up("md"));
  const tags = useSelector(selectAllTags) || [];
  const tsTagUIDs = (ts.metadata.tags || []).map((tag) => tag.uid);
  const tsTags = tags.filter((tag: Tag) => tsTagUIDs.includes(tag.uid)) || [];
  const tsTagsJSX = tsTags.map((tag: Tag) => {
    return (
      <Grid key={tag.uid}>
        <Chip
          size="lg"
          variant="solid"
          sx={(theme) => {
            return {
              // @ts-ignore
              bgcolor: theme.colorSchemes[mode].tagColor,
              borderRadius: 7,
              color: "#000000",
              wordBreak: "break-word",
            };
          }}
        >
          {" "}
          {tag.name}
        </Chip>
      </Grid>
    );
  });
  return (
    <Grid key={ts.metadata.uid} sx={{ borderTop: 1, borderColor: "#ff9d25" }}>
      <Grid container={true} direction="column">
        {/*Title*/}
        <Grid padding={0.5} margin={0.5}>
          <Typography
            level={h1Title ? "h1" : "h2"}
            sx={{ wordBreak: "break-word" }}
            noWrap={false}
          >
            {legendSquareColor ? (
              <Typography
                level="h3"
                sx={{ wordBreak: "break-word" }}
                noWrap={false}
              >
                <div
                  style={{
                    display: "inline",
                    color:
                      theme.colorSchemes[mode].chart.line.color[
                        legendSquareColor
                      ],
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                >
                  &#9632;
                </div>
              </Typography>
            ) : null}
            {ts.metadata.name}
            {ts.metadata.has_visualization_vector ? (
              <Link to={`/2dmap?ts_uid=${ts.metadata.uid}`}>
                <Button
                  variant="solid"
                  startDecorator={<MapOutlinedIcon />}
                  sx={(theme) => {
                    return {
                      // @ts-ignore
                      bgcolor: theme.colorSchemes[mode].metricValue["blue"],
                      borderRadius: 7,
                      color: "#ffffff",
                      wordBreak: "break-word",
                      marginLeft: 2,
                      padding: 0.5,
                    };
                  }}
                >
                  {" "}
                  Explore in 2D Map!
                </Button>
              </Link>
            ) : null}
          </Typography>
        </Grid>

        <Grid
          padding={0.5}
          margin={0.5}
          sx={(theme) => {
            return {
              border: 1,
              borderColor: "#ff9d25",
              // @ts-ignore
              bgcolor: theme.colorSchemes[mode].tagBackgroundColor,
            };
          }}
          borderRadius={7}
        >
          {ts.timestamps.length > 0 && ts.values.length > 0 && (
            <Typography sx={{ wordBreak: "break-word" }} noWrap={false}>
              <Typography
                level="h3"
                component="span"
                sx={{ wordBreak: "break-word" }}
                noWrap={false}
              >
                Last recorded value was{" "}
                {Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 2,
                }).format(ts.values.at(-1) || 0.0)}{" "}
                {ts.metadata.unit} on
              </Typography>
              <Typography
                level="h3"
                component="span"
                sx={{ wordBreak: "break-word" }}
                noWrap={false}
              >
                {" "}
                {new Date(
                  ts.timestamps.at(-1) || new Date().getTime(),
                ).toLocaleString()}
              </Typography>
            </Typography>
          )}
        </Grid>

        {/*Tags*/}
        {!!tsTagsJSX.length && (
          <Grid padding={0.5} margin={0.5}>
            <Grid
              container={true}
              direction="row"
              spacing={1}
              sx={(theme) => {
                return {
                  border: 1,
                  borderColor: "#ff9d25",
                  // @ts-ignore
                  bgcolor: theme.colorSchemes[mode].tagBackgroundColor,
                };
              }}
              borderRadius={7}
            >
              {tsTagsJSX}
            </Grid>
          </Grid>
        )}

        {/*Description*/}
        {ts.metadata.description && ts.metadata.description.length > 0 && (
          <Grid
            padding={0.5}
            margin={0.5}
            sx={(_theme) => {
              return {
                border: 1,
                borderColor: "#ff9d25",
                maxHeight: "7em",
                overflowY: "scroll",
              };
            }}
            borderRadius={7}
          >
            <Typography
              level="h4"
              noWrap={false}
              component="span"
              sx={{ wordBreak: "break-word" }}
            >
              Description:
            </Typography>
            <Typography
              level="body-md"
              noWrap={false}
              component="span"
              sx={{ wordBreak: "break-word" }}
            >
              {ts.metadata.description}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

export default TSMetadata;
