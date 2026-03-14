import { HelmetProvider } from "@slorber/react-helmet-async";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

const container = document.getElementById("root");

if (container == null) {
  throw new Error("Missing root container");
}

createRoot(container).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
