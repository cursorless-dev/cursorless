import {TextEditor, window} from "vscode";

/**
 * This exists for ease of overriding in Cursorless Everywhere.
 *
 * It will eventually be replaced by the `ide` abstraction.
 */
export function getActiveEditor(): TextEditor | undefined {
  return window.activeTextEditor;
}
