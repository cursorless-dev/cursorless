import { isTesting } from "@cursorless/common";
import { DefaultKeyMap } from "./TokenTypeHelpers";

const DEFAULT_VSCODE_COMMAND_KEYMAP = {
  c: "editor.action.addCommentLine",
  mc: {
    commandId: "editor.action.addCommentLine",
    executeAtTarget: true,
  },
  mm: {
    commandId: "editor.action.addCommentLine",
    executeAtTarget: true,
    keepChangedSelection: true,
    exitCursorlessMode: true,
  },
};

// FIXME: Switch to a better mocking setup. We don't use our built in
// configuration set up because that is probably going to live server side, and
// the keyboard setup will probably live client side
export const defaultMap: DefaultKeyMap = isTesting()
  ? {
      actions: { t: "setSelection" },
      colors: { d: "default" },
      scopes: { sf: "namedFunction" },
      vscodeCommands: DEFAULT_VSCODE_COMMAND_KEYMAP,
    }
  : {};
