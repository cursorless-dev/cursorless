import type { TestCaseFixtureLegacy } from "@cursorless/common";

const failingFixtures = [
  // actual finalState.selections.anchor is -1 compared to expected (other fixture.command.action.name == "insertCopyBefore" tests pass fine)
  "recorded/actions/cloneToken4",
  "recorded/actions/cloneUpToken4",
  // -> Error: nvim_execute_lua: Cursor position outside buffer
  "recorded/compoundTargets/chuckStartOfBlockPastStartOfFile",
  // actual finalState.selections.anchor is -1 compared to expected
  "recorded/implicitExpansion/chuckCoreThat",
  "recorded/implicitExpansion/chuckLeadingThat",
  "recorded/marks/chuckNothing",
  // -> wrong fixture.finalState.selections
  "recorded/implicitExpansion/cloneThat2",
  "recorded/implicitExpansion/cloneThis",
  "recorded/implicitExpansion/cloneThis2",
];

function isFailingFixture(name: string, fixture: TestCaseFixtureLegacy) {
  const action =
    typeof fixture.command.action === "object"
      ? fixture.command.action.name
      : fixture.command.action;

  switch (action) {
    // "recorded/actions/insertEmptyLines/puffThis*" -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
    case "insertEmptyLinesAround":
      return true;
    // "recorded/actions/insertEmptyLines/floatThis*" ->    Error: nvim_buf_get_lines: Index out of bounds
    //                                                -> or actual finalState.selections.anchor is -1 compared to expected
    //                                                      actual finalState.thatMark.contentRange.start is -1 compared to expected
    case "insertEmptyLineAfter":
      return true;
    // "recorded/actions/insertEmptyLines/dropThis*"  -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
    case "insertEmptyLineBefore":
      return true;
    // "recorded/actions/cloneToken*" and "recorded/itemTextual/cloneTwoItems" -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
    case "insertCopyAfter":
      return true;
    // "recorded/implicitExpansion/pour*" -> not supported for now
    case "editNewLineAfter":
      return true;
    // "recorded/actions/{decrement,increment}File" -> are not supported atm
    case "decrement":
      return true;
    case "increment":
      return true;
    // "recorded/actions/snippets/*" -> not supported for now
    case "insertSnippet":
    case "generateSnippet":
      return true;
    case "wrapWithSnippet":
      return true;
    // "recorded/actions/insertEmptyLines/floatThis*" -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
    case "breakLine":
      return true;
    case "joinLines":
      return true;
    // "recorded/actions/shuffleThis" is not supported atm
    case "randomizeTargets":
      return true;
    // "recorded/actions/pasteBeforeToken" -> wrong fixture.finalState.documentContents/selections/thatMark
    case "pasteFromClipboard":
      return true;
    // "recorded/actions/copySecondToken" -> wrong fixture.finalState.clipboard
    case "copyToClipboard":
      return true;
    case "indentLine":
    case "outdentLine":
      return true;
  }

  // "recorded/lineEndings/*" -> fixture.finalState.documentContents contains \n instead of \r\n
  if (name.includes("/lineEndings/")) {
    return true;
  }

  // "recorded/fallback/take*" -> wrong fixture.finalState.selections
  if (name.includes("/fallback/take")) {
    return true;
  }

  // We blacklist remaining unsorted failing tests
  if (failingFixtures.includes(name)) {
    return true;
  }

  return false;
}

export function shouldRunTest(
  name: string,
  fixture: TestCaseFixtureLegacy,
): boolean {
  // We don't support decorated symbol marks (hats) yet
  const hasMarks =
    fixture.initialState.marks != null &&
    Object.keys(fixture.initialState.marks).length > 0;

  // we don't support multiple selections in neovim (we don't support multiple cursors atm)
  const hasMultipleSelections =
    fixture.initialState.selections.length > 1 ||
    (fixture.finalState && fixture.finalState.selections.length > 1);

  // We don't support Tree sitter yet (which requires a code languageId)
  const needTreeSitter = fixture.languageId !== "plaintext";

  if (hasMarks || hasMultipleSelections || needTreeSitter) {
    return false;
  }

  // Fixtures that will need to be fixed in the future
  if (isFailingFixture(name, fixture)) {
    return false;
  }

  return true;
}
