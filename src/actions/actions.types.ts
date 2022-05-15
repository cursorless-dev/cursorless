import { Target } from "../typings/target.types";
import { SelectionWithEditor } from "../typings/Types";

export type ActionType =
  // | "callAsFunction"
  | "clearAndSetSelection"
  | "copyToClipboard"
  | "cutToClipboard"
  | "deselect"
  // | "editNewLineAfter"
  // | "editNewLineBefore"
  | "executeCommand"
  | "extractVariable"
  | "findInWorkspace"
  | "foldRegion"
  | "followLink"
  | "getText"
  | "highlight"
  | "indentLine"
  // | "insertCopyAfter"
  // | "insertCopyBefore"
  // | "insertEmptyLineAfter"
  // | "insertEmptyLineBefore"
  // | "insertEmptyLinesAround"
  // | "moveToTarget"
  | "outdentLine"
  | "unfoldRegion"
  | "pasteFromClipboard"
  | "remove"
  // |"toggleLineBreakpoint"
  | "toggleLineComment"
  | "replace"
  // | "replaceWithTarget"
  // | "reverseTargets"
  // | "rewrapWithPairedDelimiter"
  | "scrollToBottom"
  | "scrollToCenter"
  | "scrollToTop"
  | "setSelection"
  | "setSelectionAfter"
  | "setSelectionBefore";

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
