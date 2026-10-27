import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../../packages/ui/src/assets/fonts/inter.css";
import "./styles.css";
import "@mailboost/erpboost-ui/styles";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
