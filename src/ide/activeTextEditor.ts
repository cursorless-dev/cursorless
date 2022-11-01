import { TextEditor, window } from "vscode";

/**
 * Returns the active text editor; should be used rather than reading
 * `vscode.window.activeTextEditor` directly.
 *
 * This exists for ease of overriding in Cursorless Everywhere.
 *
 * It will eventually be replaced by `ide`'s `Editor` abstraction.
 */
export function getActiveTextEditor(): TextEditor | undefined {
  return window.activeTextEditor; // eslint-disable-line no-restricted-properties
}
