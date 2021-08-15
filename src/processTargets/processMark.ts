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
      return processCursorToken(context);
    case "decoratedSymbol":
      return processDecoratedSymbol(context, mark);
    case "lineNumber":
      return processLineNumber(context, mark);
  }
}

function processCursorToken(context: ProcessedTargetsContext) {
  const tokenSelections = context.currentSelections.map((selection) => {
    const tokenSelection =
      context.navigationMap.getTokenSelectionForSelection(selection);
    if (tokenSelection == null) {
      throw new Error("Couldn't find token in selection");
    }
    return tokenSelection;
  });
  return tokenSelections;
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
