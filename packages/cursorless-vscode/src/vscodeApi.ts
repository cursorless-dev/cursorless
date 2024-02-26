import { VscodeApi } from "@cursorless/vscode-common";
import { env, window, workspace } from "vscode";

/**
 * A very thin wrapper around the VSCode API that allows us to mock it for
 * testing. This is necessary because the test harness gets bundled separately
 * from the extension code, so if we just import the VSCode API directly from
 * the extension code, and from the test harness, we'll end up with two copies
 * of the VSCode API, so the mocks won't work.
 */
export const vscodeApi: VscodeApi = {
  workspace,
  window,
  env,
  editor: {
    setDecorations(editor, ...args) {
      return editor.setDecorations(...args);
    },
  },
};
