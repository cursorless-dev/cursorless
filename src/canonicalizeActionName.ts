import { ActionType } from "./typings/Types";

const actionAliasToCanonicalName: Record<string, ActionType> = {
  clearAndSetSelection: "clear",
  copyToClipboard: "copy",
  cutToClipboard: "cut",
  editNewLineAfter: "editNewLineBelow",
  editNewLineBefore: "editNewLineAbove",
  findInWorkspace: "findInFiles",
  foldRegion: "fold",
  indentLine: "indentLines",
  insertCopyAfter: "copyLinesDown",
  insertCopyBefore: "copyLinesUp",
  insertEmptyLineAfter: "insertEmptyLineBelow",
  insertEmptyLineBefore: "insertEmptyLineAbove",
  moveToTarget: "move",
  outdentLine: "outdentLines",
  pasteFromClipboard: "paste",
  remove: "delete",
  replaceWithTarget: "bring",
  reverseTargets: "reverse",
  sortTargets: "sort",
  swapTargets: "swap",
  toggleLineBreakpoint: "setBreakpoint",
  toggleLineComment: "commentLines",
  unfoldRegion: "unfold",
  wrapWithPairedDelimiter: "wrap",
};

export default function canonicalizeActionName(actionName: string) {
  return actionAliasToCanonicalName[actionName] ?? actionName;
}
