import { Target } from "../typings/target.types";
import { SelectionWithEditor } from "../typings/Types";

export type ActionType =
  | "wrapWithSnippet"
  | "wrapWithPairedDelimiter"
  | "unfoldRegion"
  | "toggleLineComment"
  | "toggleLineBreakpoint"
  | "swapTargets"
  | "sortTargets"
  | "setSelectionBefore"
  | "setSelectionAfter"
  | "setSelection"
  | "scrollToTop"
  | "scrollToCenter"
  | "scrollToBottom"
  | "rewrapWithPairedDelimiter"
  | "reverseTargets"
  | "replaceWithTarget"
  | "replace"
  | "remove"
  | "randomizeTargets"
  | "pasteFromClipboard"
  | "outdentLine"
  | "moveToTarget"
  | "insertEmptyLinesAround"
  | "insertEmptyLineBefore"
  | "insertEmptyLineAfter"
  | "insertCopyBefore"
  | "insertCopyAfter"
  | "indentLine"
  | "highlight"
  | "getText"
  | "followLink"
  | "foldRegion"
  | "findInWorkspace"
  | "extractVariable"
  | "executeCommand"
  | "editNewLineBefore"
  | "editNewLineAfter"
  | "deselect"
  | "cutToClipboard"
  | "copyToClipboard"
  | "clearAndSetSelection"
  | "callAsFunction";

export interface ActionReturnValue {
  returnValue?: any;
  thatMark?: SelectionWithEditor[];
  sourceMark?: SelectionWithEditor[];
}

export interface Action {
  run(targets: Target[][], ...args: any[]): Promise<ActionReturnValue>;

  /**
   * Used to define default values for parts of target during inference.
   * @param args Extra args to command
   */
  // TODO
  // getTargetPreferences(...args: any[]): ActionPreferences[];
}

export type ActionRecord = Record<ActionType, Action>;
