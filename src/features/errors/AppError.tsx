import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";

function AppError({
  code,
  message,
  borderWidth = 1.618,
  borderRadius = 7,
  borderColor = "red",
  margin = undefined,
}: {
  code?: string | number;
  message?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderColor?: string;
  margin?: number | string;
}) {
  code = code?.toString();
  const title: string = code ? "Server Error" : "Error";
  message = message ? message : "No further details available";

  return (
    <Card
      sx={{
        margin: margin,
        border: borderWidth, //  maybe make it 2
        borderRadius: borderRadius,
        borderColor: borderColor,
      }}
    >
      <Typography level="h2">{title}</Typography>
      {code ? <Typography level="body-md">{code}</Typography> : <></>}
      {message ? <Typography level="body-md">{message}</Typography> : <></>}
    </Card>
  );
}

export default AppError;
