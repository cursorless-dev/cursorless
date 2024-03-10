import { createRoot } from "react-dom/client";
import React from "react";
import { App } from "./App";
import type { State } from "./types";

const vscode = acquireVsCodeApi<State>();

createRoot(document.getElementById("root")!).render(
  <App
    initialState={vscode.getState() ?? { type: "pickingTutorial" }}
    vscode={vscode}
  />,
);
