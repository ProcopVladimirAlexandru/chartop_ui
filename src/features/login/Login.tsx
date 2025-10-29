import Sheet from "@mui/joy/Sheet";
import Grid from "@mui/joy/Grid";
import FormLabel from "@mui/joy/FormLabel";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import Link from "@mui/joy/Link";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import { useState } from "react";

function validateEmail(email: string): string | undefined {
  if (!email || email.length === 0) {
    return "Please specify an email address";
  }
  const atIndex = email.indexOf("@");
  if (atIndex < 0 || atIndex >= email.length - 1) {
    return "Please specify a valid email address";
  }
}

function validatePassword(pwd: string): string | undefined {
  if (!pwd || pwd.length < 7) {
    return "Please specify a password of at least 7 characters";
  }
}

function validateConfirmPassword(
  pwd: string,
  confirmPwd: string,
): string | undefined {
  if (pwd != confirmPwd) {
    return "Password confirmation failed";
  }
}

function Login() {
  const [newAccount, setNewAccount] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const emailErrorMessage = validateEmail(email);
  const pwdErrorMessage = validatePassword(pwd);
  const confirmPwdErrorMessage = validateConfirmPassword(pwd, confirmPwd);
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      spacing={0} // this makes the page go out of bounds ...
      mt={5}
      direction="column"
    >
      <Sheet
        sx={{
          width: "30em",
          mx: "auto", // margin left & right
          marginTop: 0, // margin top & bottom
          marginBottom: 4, // margin top & bottom
          py: 3, // padding top & bottom
          px: 2, // padding left & right
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: "sm",
          boxShadow: "md",
        }}
        variant="outlined"
      >
        <Typography level="h4" component="h1">
          <b>{newAccount ? "Welcome" : "Welcome back"}</b>
        </Typography>
        <Typography level="body-sm">
          {newAccount ? "Create an account to continue" : "Log in to continue."}
        </Typography>
        <FormControl required error={!!email && !!emailErrorMessage}>
          <FormLabel>Email</FormLabel>
          <Input
            // html input attribute
            name="email"
            type="email"
            placeholder="someone@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {email && emailErrorMessage && (
            <FormHelperText>{emailErrorMessage}</FormHelperText>
          )}
        </FormControl>
        <FormControl required error={!!pwd && !!pwdErrorMessage}>
          <FormLabel>Password</FormLabel>
          <Input
            // html input attribute
            name="password"
            type="password"
            placeholder="password"
            value={pwd}
            onChange={(event) => setPwd(event.target.value)}
          />
          {pwd && pwdErrorMessage && (
            <FormHelperText>{pwdErrorMessage}</FormHelperText>
          )}
        </FormControl>
        {newAccount && (
          <FormControl required error={!!confirmPwdErrorMessage}>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              // html input attribute
              name="confirmPassword"
              type="password"
              placeholder="password"
              value={confirmPwd}
              onChange={(event) => setConfirmPwd(event.target.value)}
            />
            {confirmPwdErrorMessage && (
              <FormHelperText>{confirmPwdErrorMessage}</FormHelperText>
            )}
          </FormControl>
        )}
        <Button
          sx={{ mt: 1 /* margin top */ }}
          disabled={
            !!(
              emailErrorMessage ||
              pwdErrorMessage ||
              (newAccount && confirmPwdErrorMessage)
            )
          }
        >
          Log in
        </Button>
        <Typography
          endDecorator={
            <Link onClick={() => setNewAccount(true)}>Create account</Link>
          }
          fontSize="sm"
          sx={{ alignSelf: "center" }}
        >
          Don&apos;t have an account?
        </Typography>
      </Sheet>
    </Grid>
  );
}

export default Login;
