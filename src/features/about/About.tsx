import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";

function About() {
  return (
    <Card sx={{ m: 2, borderColor: "#ff9d25" }}>
      <Typography level="h1">About Chartop</Typography>

      <Typography level="h2">Overview</Typography>
      <Typography level="body-md">
        The Chartop project presents a modular and adaptive dashboard which
        specializes in bringing to light the critical aspects of your data.
        Currently, we support <b>time series</b> data: a numerical measurement
        which varies with time, such as stock prices or inflation rates.
      </Typography>

      <Typography level="h2">Filtering</Typography>
      <Typography level="body-md">
        Each time series is associated with a set of tags and this allows you to
        filter the data according to your interests. Tag selection is optional:
        if you omit this field then all data will be considered, regardless of
        its tags.<br></br>
        The search bar makes finding tags easy and, once you have selected the
        desired one, add it to the filters using the <b>Add</b> button. Your
        selection will be displayed underneath the search bar. If you change
        your mind, click the <b>X</b> button next to the tag you wish to remove.
        If you have added at least two tags then an additional filter appears
        which allows you to choose whether the returned data should contain
        <b> ALL</b> or <b>ANY</b> of these tags.
      </Typography>

      <Typography level="h2">Sorting</Typography>
      <Typography level="body-md">
        There are several metrics Chartop computes for every time series. In
        this section you choose the metric by which to sort the results and the
        order:
        <b> ASCENDING</b> or <b>DESCENDING</b>. You can now hit the{" "}
        <b>Search</b> button to see the results.
      </Typography>

      <Typography level="h2">Results</Typography>
      <Typography level="body-md">
        A ranking of the data is returned after you hit the <b>Search</b>{" "}
        button. Each section is dedicated to a time series and contains the sort
        metric value at the top and various other information, such as the
        title, tags, description and chart. To the right you have the{" "}
        <b>Metrics</b> section: the values for all the available metrics
        computed for that time series.
      </Typography>
    </Card>
  );
}

export default About;
