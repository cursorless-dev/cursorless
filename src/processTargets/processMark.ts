import { Selection } from "vscode";
import {
  CursorMarkToken,
  DecoratedSymbol,
  LineNumber,
  LineNumberPosition,
  Mark,
  ProcessedTargetsContext,
  SelectionWithEditor,
} from "../typings/Types";
import { selectionWithEditorFromPositions } from "../util/selectionUtils";

export default function (
  context: ProcessedTargetsContext,
  mark: Mark
): SelectionWithEditor[] {
  switch (mark.type) {
    case "cursor":
      return context.currentSelections;
    case "that":
      return context.thatMark;
    case "source":
      return context.sourceMark;
    case "cursorToken":
      return context.currentSelections.map((selection) =>
        getTokenSelectionForSelection(context, selection)
      );
    case "decoratedSymbol":
      return processDecoratedSymbol(context, mark);
    case "lineNumber":
      return processLineNumber(context, mark);
  }
}

/**
 * Given a selection returns a new selection which contains the tokens
 * intersecting the given selection. Uses heuristics to tie break when the
 * given selection is empty and abuts 2 adjacent tokens
 * @param selection Selection to operate on
 * @returns Modified selection
 */
function getTokenSelectionForSelection(
  context: ProcessedTargetsContext,
  selection: SelectionWithEditor
): SelectionWithEditor {
  let tokens =
    context.navigationMap.getTokenIntersectionsForSelection(selection);
  // Use single token for overlapping or adjacent range
  if (selection.selection.isEmpty) {
    // If multiple matches sort and take the first
    tokens.sort(({ token: a }, { token: b }) => {
      // First sort on alphanumeric
      const aIsAlphaNum = isAlphaNum(a.text);
      const bIsAlphaNum = isAlphaNum(b.text);
      if (aIsAlphaNum && !bIsAlphaNum) {
        return -1;
      }
      if (bIsAlphaNum && !aIsAlphaNum) {
        return 1;
      }
      // Second sort on length
      const lengthDiff = b.text.length - a.text.length;
      if (lengthDiff !== 0) {
        return lengthDiff;
      }
      // Lastly sort on start position. ie leftmost
      return a.startOffset - b.startOffset;
    });
    tokens = tokens.slice(0, 1);
  }
  // Use tokens for overlapping ranges
  else {
    tokens = tokens.filter((token) => !token.intersection.isEmpty);
    tokens.sort((a, b) => a.token.startOffset - b.token.startOffset);
  }
  if (tokens.length < 1) {
    throw new Error("Couldn't find token in selection");
  }
  const start = tokens[0].token.range.start;
  const end = tokens[tokens.length - 1].token.range.end;
  return selectionWithEditorFromPositions(selection, start, end);
}

function processDecoratedSymbol(
  context: ProcessedTargetsContext,
  mark: DecoratedSymbol
) {
  const token = context.navigationMap.getToken(
    mark.symbolColor,
    mark.character
  );
  if (token == null) {
    throw new Error(
      `Couldn't find mark ${mark.symbolColor} '${mark.character}'`
    );
  }
  return [
    {
      selection: new Selection(token.range.start, token.range.end),
      editor: token.editor,
    },
  ];
}

function processLineNumber(context: ProcessedTargetsContext, mark: LineNumber) {
  const getLine = (linePosition: LineNumberPosition) =>
    linePosition.isRelative
      ? context.currentEditor!.selection.active.line + linePosition.lineNumber
      : linePosition.lineNumber;
  return [
    {
      selection: new Selection(
        getLine(mark.anchor),
        0,
        getLine(mark.active),
        0
      ),
      editor: context.currentEditor!,
    },
  ];
}

function isAlphaNum(text: string) {
  return /^\w+$/.test(text);
}
