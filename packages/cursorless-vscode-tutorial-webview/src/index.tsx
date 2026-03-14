import { render } from "preact";
import { App } from "./App";

render(<App vscode={acquireVsCodeApi()} />, getRoot());

function getRoot() {
  const root = document.getElementById("root");
  if (root == null) {
    throw new Error("Missing root container");
  }
  return root;
}
