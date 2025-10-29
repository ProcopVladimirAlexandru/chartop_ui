import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import { ReactNode } from "react";

import Header from "./features/header/Header";
import Top from "./features/top/Top";
import VectorVisualization from "./features/vector_visualization/VectorVisualization";
import About from "./features/about/About";
import Contact from "./features/contact/Contact";
import AppError from "./features/errors/AppError";
import { BrowserRouter, Routes, Route } from "react-router";

const globalTheme = extendTheme({
  colorSchemes: {
    light: {
      // @ts-ignore
      tagColor: "#ff9d25",
      tagBackgroundColor: "#ffe8cc",
      metricValue: { red: "#ff1f1f", blue: "#0a22f5", green: "#10c21f" },
      chart: {
        title: "#000000",
        hAxis: {
          gridlines: "#CCC",
          title: "#ffffff",
          textStyle: "#000000",
        },
        vAxis: {
          gridlines: "#CCC",
          title: "#000000",
          textStyle: "#000000",
        },
        chartArea: "#ffffff",
        background: "#ffffff",
        legend: "#000000",
        line: {
          color: {
            blue: "#0866be",
            red: "#ff3333",
          },
        },
      },
      visualizationVectors: {
        dot: {
          color: {
            main: "#0866be",
            target: "#ff3333",
          },
        },
      },
      palette: {
        neutral: {
          "50": "#fafafa",
          "100": "#f5f5f5",
          "200": "#eeeeee",
          "300": "#e0e0e0",
          "400": "#bdbdbd",
          "500": "#9e9e9e",
          "600": "#757575",
          "700": "#616161",
          "800": "#424242",
          "900": "#212121",
        },
      },
    },
    dark: {
      // @ts-ignore
      tagColor: "#ffe8cc",
      tagBackgroundColor: "#ff9d25",
      metricValue: { red: "#ff5252", blue: "#70b6fa", green: "#00ff5e" },
      chart: {
        title: "#000000",
        hAxis: {
          gridlines: "#CCC",
          title: "#ffffff",
          textStyle: "#ffffff",
        },
        vAxis: {
          gridlines: "#CCC",
          title: "#ffffff",
          textStyle: "#ffffff",
        },
        chartArea: "#000000",
        background: "#000000",
        legend: "#ffffff",
        line: {
          color: {
            blue: "#3ca8de",
            red: "#ff3333",
          },
        },
      },
      visualizationVectors: {
        dot: {
          color: {
            main: "#0866be",
            target: "#ff3333",
          },
        },
      },
      palette: {
        neutral: {
          "50": "#fafafa",
          "100": "#f5f5f5",
          "200": "#eeeeee",
          "300": "#e0e0e0",
          "400": "#bdbdbd",
          "500": "#9e9e9e",
          "600": "#757575",
          "700": "#616161",
          "800": "#424242",
          "900": "#212121",
        },
        background: {
          body: "var(--joy-palette-divider)",
          surface: "var(--joy-palette-warning-softDisabledBg)",
        },
      },
    },
  },
  components: {
    // The component identifier always start with `Joy${ComponentName}`.
    JoyButton: {
      styleOverrides: {
        root: () => {
          return {
            // fontSize: theme.vars.fontSize.lg,
            "@media (max-width:800px)": {
              // fontSize: theme.typography['h1'].fontSize,
              // fontSize: theme.vars.fontSize.xlg
              fontSize: "0.65rem",
            },
          };
        },
      },
    },
  },
  typography: {
    h1: {
      "@media (max-width:400px)": {
        fontSize: "1.1rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.2rem",
      },
      "@media (max-width:800px)": {
        fontSize: "1.55rem",
      },
      "@media (max-width:1200px)": {
        fontSize: "2rem",
      },
    },
    h2: {
      "@media (max-width:400px)": {
        fontSize: "1rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.15rem",
      },
      "@media (max-width:800px)": {
        fontSize: "1.45rem",
      },
      "@media (max-width:1200px)": {
        fontSize: "1.7rem",
      },
    },
    h3: {
      "@media (max-width:400px)": {
        fontSize: "0.8rem",
      },
      "@media (max-width:600px)": {
        fontSize: "0.9rem",
      },
      "@media (max-width:800px)": {
        fontSize: "1rem",
      },
    },
    h4: {
      "@media (max-width:400px)": {
        fontSize: "0.7rem",
      },
      "@media (max-width:600px)": {
        fontSize: "0.8rem",
      },
      "@media (max-width:800px)": {
        fontSize: "0.9rem",
      },
    },
    "body-lg": {
      "@media (max-width:400px)": {
        fontSize: "0.7rem",
      },
      "@media (max-width:600px)": {
        fontSize: "0.8rem",
      },
      "@media (max-width:800px)": {
        fontSize: "0.9rem",
      },
    },
    "body-md": {
      "@media (max-width:400px)": {
        fontSize: "0.6rem",
      },
      "@media (max-width:600px)": {
        fontSize: "0.7rem",
      },
      "@media (max-width:800px)": {
        fontSize: "0.8rem",
      },
    },
  },
});

function App() {
  const pages: Array<Page> = [
    {
      headerLinkText: "Chartop",
      element: <Top />,
      uid: "top",
      index: true,
      path: "/",
    },
    {
      headerLinkText: "2D Map",
      element: <VectorVisualization />,
      uid: "vectorVisualization",
      path: "/2dmap",
    },
    {
      headerLinkText: "About",
      element: <About />,
      uid: "about",
      path: "/about",
    },
    {
      headerLinkText: "Contact",
      element: <Contact />,
      uid: "contact",
      path: "/contact",
    },
    {
      element: (
        <AppError
          code={undefined}
          message="Sorry, this page is not available"
          margin="10%"
        />
      ),
      uid: "AppError",
      path: "*",
    },
  ];

  return (
    <CssVarsProvider defaultMode="light" theme={globalTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Header pages={pages} sx={{ position: "sticky" }}></Header>
        <Routes>
          {pages.map((page) => (
            <Route
              key={page.uid}
              index={page.index}
              element={page.element}
              path={page.path}
            ></Route>
          ))}
        </Routes>
      </BrowserRouter>
    </CssVarsProvider>
  );
}

export default App;

export interface Page {
  element: ReactNode;
  uid: string;
  headerLinkText?: string;
  path: string;
  index?: boolean;
}
