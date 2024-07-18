const actionNames = [
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
  "experimental.setInstanceReference",
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

export type ActionTypeV5 = (typeof actionNames)[number];

export interface ActionCommandV5 {
  /**
   * The action to run
   */
  name: ActionTypeV5;

  /**
   * A list of arguments expected by the given action.
   */
  args?: unknown[];
}
