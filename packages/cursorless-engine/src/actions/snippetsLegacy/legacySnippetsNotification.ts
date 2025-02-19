import { showWarning } from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";

// Show only once per vscode instance
let wasShown = false;

export function showLegacySnippetsNotification() {
  if (wasShown) {
    return;
  }

  void showWarning(
    ide().messages,
    "legacySnippets",
    "Cursorless snippets are deprecated. Please use community snippets. Update to latest cursorless-talon and say 'cursorless migrate snippets'.",
  );

  wasShown = true;
}
