import { render } from "preact";
import { StrictMode } from "preact/compat";
import { App } from "./App";
import "./styles.css";

render(
  <StrictMode>
    <App />
  </StrictMode>,
  getRoot(),
);

function getRoot() {
  const root = document.getElementById("root");
  if (root == null) {
    throw new Error("Missing root container");
  }
  return root;
}
