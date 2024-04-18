import { IDE } from "../ide/types/ide.types";

// we rely on the ide.runMode when running as a vscode extension
// but we need an environment variable for other types of tests
export const isTesting = (ide?: IDE) =>
  ide?.runMode === "test" || process.env.CURSORLESS_TEST != null;

export const isProduction = (ide: IDE) => ide.runMode === "production";
