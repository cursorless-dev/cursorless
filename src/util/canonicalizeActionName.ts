import { ActionType } from "../typings/Types";

const actionAliasToCanonicalName: Record<string, ActionType> = {
  bring: "replaceWithTarget",
  call: "callAsFunction",
  clear: "clearAndSetSelection",
  commentLines: "toggleLineComment",
  copy: "copyToClipboard",
  cut: "cutToClipboard",
  delete: "remove",
  editNewLineAbove: "editNewLineBefore",
  editNewLineBelow: "editNewLineAfter",
  findInFiles: "findInWorkspace",
  fold: "foldRegion",
  indentLines: "indentLine",
  insertEmptyLineAbove: "insertEmptyLineBefore",
  insertEmptyLineBelow: "insertEmptyLineAfter",
  insertLineAfter: "editNewLineAfter",
  insertLineBefore: "editNewLineBefore",
  move: "moveToTarget",
  outdentLines: "outdentLine",
  paste: "pasteFromClipboard",
  reverse: "reverseTargets",
  setBreakpoint: "toggleLineBreakpoint",
  sort: "sortTargets",
  swap: "swapTargets",
  unfold: "unfoldRegion",
  use: "replaceWithTarget",
  wrap: "wrapWithPairedDelimiter",
};

export default function canonicalizeActionName(actionName: string) {
  return actionAliasToCanonicalName[actionName] ?? actionName;
}
