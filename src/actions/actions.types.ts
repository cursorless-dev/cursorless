import { ModifierStage } from "../processTargets/PipelineStages.types";
import { Target } from "../typings/target.types";
import { SelectionWithEditor } from "../typings/Types";

export type ActionType =
  | "callAsFunction"
  | "clearAndSetSelection"
  | "copyToClipboard"
  | "cutToClipboard"
  | "deselect"
  | "editNew"
  | "editNewLineAfter"
  | "editNewLineBefore"
  | "executeCommand"
  | "extractVariable"
  | "findInWorkspace"
  | "foldRegion"
  | "followLink"
  | "getText"
  | "highlight"
  | "indentLine"
  | "insertCopyAfter"
  | "insertCopyBefore"
  | "insertEmptyLineAfter"
  | "insertEmptyLineBefore"
  | "insertEmptyLinesAround"
  | "insertSnippet"
  | "moveToTarget"
  | "outdentLine"
  | "pasteFromClipboard"
  | "randomizeTargets"
  | "remove"
  | "replace"
  | "replaceWithTarget"
  | "reverseTargets"
  | "rewrapWithPairedDelimiter"
  | "scrollToBottom"
  | "scrollToCenter"
  | "scrollToTop"
  | "setSelection"
  | "setSelectionAfter"
  | "setSelectionBefore"
  | "sortTargets"
  | "swapTargets"
  | "toggleLineBreakpoint"
  | "toggleLineComment"
  | "unfoldRegion"
  | "wrapWithPairedDelimiter"
  | "wrapWithSnippet";

export interface ActionReturnValue {
  returnValue?: any;
  thatMark?: SelectionWithEditor[];
  sourceMark?: SelectionWithEditor[];
}

export interface Action {
  run(targets: Target[][], ...args: any[]): Promise<ActionReturnValue>;

  /**
   * Used to define final stages that should be run at the end of the pipeline before the action
   * @param args Extra args to command
   */
  getFinalStages?(...args: any[]): ModifierStage[];
}

export type ActionRecord = Record<ActionType, Action>;
