export const actionNames = [
  "callAsFunction",
  "clearAndSetSelection",
  "copyToClipboard",
  "cutToClipboard",
  "deselect",
  "editNew",
  "editNewLineAfter",
  "editNewLineBefore",
  "executeCommand",
  "extractVariable",
  "findInWorkspace",
  "foldRegion",
  "followLink",
  "generateSnippet",
  "getText",
  "highlight",
  "indentLine",
  "insertCopyAfter",
  "insertCopyBefore",
  "insertEmptyLineAfter",
  "insertEmptyLineBefore",
  "insertEmptyLinesAround",
  "insertSnippet",
  "moveToTarget",
  "outdentLine",
  "pasteFromClipboard",
  "randomizeTargets",
  "remove",
  "rename",
  "replace",
  "replaceWithTarget",
  "revealDefinition",
  "revealTypeDefinition",
  "reverseTargets",
  "rewrapWithPairedDelimiter",
  "experimentalSetInstanceReference",
  "scrollToBottom",
  "scrollToCenter",
  "scrollToTop",
  "setSelection",
  "setSelectionAfter",
  "setSelectionBefore",
  "showDebugHover",
  "showHover",
  "showQuickFix",
  "showReferences",
  "sortTargets",
  "swapTargets",
  "toggleLineBreakpoint",
  "toggleLineComment",
  "unfoldRegion",
  "wrapWithPairedDelimiter",
  "wrapWithSnippet",
] as const;

export type ActionType = (typeof actionNames)[number];

export interface ActionCommand {
  /**
   * The action to run
   */
  name: ActionType;

  /**
   * A list of arguments expected by the given action.
   */
  args?: unknown[];
}
