import { render } from "preact";
import { StrictMode } from "preact/compat";
import { App } from "./app";

render(
  <StrictMode>
    <App />
  </StrictMode>,
  getRoot(),
);

function getRoot() {
  const root = document.querySelector("#root");
  if (root == null) {
    throw new Error("Missing root container");
  }
  return root;
}
