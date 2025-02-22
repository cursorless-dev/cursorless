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
    "Talon community snippets are now fully supported in Cursorless! Cursorless's experimental snippets are now deprecated, but in most cases we can help you migrate automatically. Update cursorless-talon and say 'cursorless migrate snippets'.",
  );

  wasShown = true;
}
