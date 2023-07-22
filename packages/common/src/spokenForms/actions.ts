import { ActionType } from "..";

const actions: Record<ActionType, string | null> = {
  scrollToBottom: "bottom",
  toggleLineBreakpoint: "break point",
  cutToClipboard: "carve",
  scrollToCenter: "center",
  clearAndSetSelection: "change",
  remove: "chuck",
  insertCopyBefore: "clone up",
  insertCopyAfter: "clone",
  toggleLineComment: "comment",
  copyToClipboard: "copy",
  scrollToTop: "crown",
  outdentLine: "dedent",
  revealDefinition: "define",
  editNewLineBefore: "drink",
  insertEmptyLineBefore: "drop",
  extractVariable: "extract",
  insertEmptyLineAfter: "float",
  foldRegion: "fold",
  followLink: "follow",
  deselect: "give",
  highlight: "highlight",
  showHover: "hover",
  indentLine: "indent",
  showDebugHover: "inspect",
  setSelectionAfter: "post",
  editNewLineAfter: "pour",
  setSelectionBefore: "pre",
  insertEmptyLinesAround: "puff",
  showQuickFix: "quick fix",
  showReferences: "reference",
  rename: "rename",
  reverseTargets: "reverse",
  findInWorkspace: "scout all",
  randomizeTargets: "shuffle",
  generateSnippet: "snippet make",
  sortTargets: "sort",
  setSelection: "take",
  revealTypeDefinition: "type deaf",
  unfoldRegion: "unfold",
  callAsFunction: "call",
  swapTargets: "swap",
  replaceWithTarget: "bring",
  moveToTarget: "move",
  wrapWithPairedDelimiter: "wrap",
  wrapWithSnippet: "wrap",
  rewrapWithPairedDelimiter: "repack",
  insertSnippet: "snippet",
  pasteFromClipboard: "paste",

  ["experimental.setInstanceReference"]: "from",

  editNew: null,
  executeCommand: null,
  getText: null,
  replace: null,

  // applyFormatter: "format",
  // findInDocument: "scout",
  // nextHomophone: "phones",
};

export function actionToSpokenForm(name: ActionType): string {
  if (name === "wrapWithSnippet") {
    name = "wrapWithPairedDelimiter";
  }
  const result = actions[name];
  if (result == null) {
    throw Error(`Unknown action '${name}'`);
  }
  return result;
}
