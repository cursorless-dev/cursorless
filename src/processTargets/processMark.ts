import { Range, Selection } from "vscode";
import {
  DecoratedSymbol,
  LineNumber,
  LineNumberPosition,
  Mark,
  ProcessedTargetsContext,
  SelectionWithEditor,
} from "../typings/Types";
import { getTokensInRange, PartialToken } from "../util/getTokensInRange";
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
 * Returns tokens that intersect with the selection that may be relevant for
 * expanding the selection to its containing token.
 * @param selection The selection
 * @returns All tokens that intersect with the selection and are on the same line as the start or endpoint of the selection
 */
function getTokenIntersectionsForSelection(selection: SelectionWithEditor) {
  let tokens = getRelevantTokens(selection);

  const tokenIntersections: { token: PartialToken; intersection: Range }[] = [];

  tokens.forEach((token) => {
    const intersection = token.range.intersection(selection.selection);
    if (intersection != null) {
      tokenIntersections.push({ token, intersection });
    }
  });

  return tokenIntersections;
}

/**
 * Given a selection, finds all tokens that we might use to expand the
 * selection.  Just looks at tokens on the same line as the start and end of the
 * selection, because we assume that a token cannot span multiple lines.
 * @param selection The selection we care about
 * @returns A list of tokens that we might expand to
 */
function getRelevantTokens(selection: SelectionWithEditor) {
  const startLine = selection.selection.start.line;
  const endLine = selection.selection.end.line;

  let tokens = getTokensInRange(
    selection.editor,
    selection.editor.document.lineAt(startLine).range
  );

  if (endLine !== startLine) {
    tokens.push(
      ...getTokensInRange(
        selection.editor,
        selection.editor.document.lineAt(endLine).range
      )
    );
  }

  return tokens;
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
  let tokens = getTokenIntersectionsForSelection(selection);
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
      return a.offsets.start - b.offsets.start;
    });
    tokens = tokens.slice(0, 1);
  }
  // Use tokens for overlapping ranges
  else {
    tokens = tokens.filter((token) => !token.intersection.isEmpty);
    tokens.sort((a, b) => a.token.offsets.start - b.token.offsets.start);
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
