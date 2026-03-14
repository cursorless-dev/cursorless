import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const root = createRoot(getRoot());

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

function getRoot() {
  const root = document.getElementById("root");
  if (root == null) {
    throw new Error("Missing root container");
  }
  return root;
}
