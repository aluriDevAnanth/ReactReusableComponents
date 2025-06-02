import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <MantineProvider defaultColorScheme="dark">
    <App />
  </MantineProvider>
);
