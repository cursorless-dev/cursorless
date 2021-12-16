import { Position, Range, TextDocument } from "vscode";
import {
  selectionFromPositions,
  selectionWithEditorFromPositions,
  selectionWithEditorFromRange,
} from "../util/selectionUtils";
import {
  InsideOutsideType,
  Modifier,
  PrimitiveTarget,
  ProcessedTargetsContext,
  SelectionContext,
  SelectionWithEditor,
  TypedSelection,
  Position as TargetPosition,
} from "../typings/Types";
import { getDocumentRange } from "../util/range";

export default function (
  context: ProcessedTargetsContext,
  target: PrimitiveTarget,
  selection: SelectionWithEditor,
  selectionContext: SelectionContext
): TypedSelection {
  switch (target.selectionType) {
    case "token":
      return processToken(target, selection, selectionContext);
    case "notebookCell":
      return processNotebookCell(target, selection, selectionContext);
    case "document":
      return processDocument(target, selection, selectionContext);
    case "line":
      return processLine(target, selection, selectionContext);
    case "paragraph":
      return processParagraph(target, selection, selectionContext);
  }
}

function processNotebookCell(
  target: PrimitiveTarget,
  selection: SelectionWithEditor,
  selectionContext: SelectionContext
): TypedSelection {
  const { selectionType, insideOutsideType, position } = target;
  return {
    selection,
    selectionType,
    position,
    insideOutsideType,
    selectionContext: { ...selectionContext, isNotebookCell: true },
  };
}

function processToken(
  target: PrimitiveTarget,
  selection: SelectionWithEditor,
  selectionContext: SelectionContext
) {
  const { selectionType, insideOutsideType, position, modifier } = target;
  return {
    selection,
    selectionType,
    position,
    insideOutsideType,
    // NB: This is a hack to work around the fact that it's not currently
    // possible to apply a modifier after processing the selection type. We
    // would really prefer that the user be able to say "just" and have that be
    // processed after we've processed the selection type, which would strip
    // away the type information and turn it into a raw target. Until that's
    // possible using the new pipelines, we instead just check for it here when
    // we're doing the selection type and bail out if it is a raw target.
    selectionContext: selectionContext.isRawSelection
      ? selectionContext
      : getTokenSelectionContext(
          selection,
          modifier,
          position,
          insideOutsideType,
          selectionContext
        ),
  };
}

function processDocument(
  target: PrimitiveTarget,
  selection: SelectionWithEditor,
  selectionContext: SelectionContext
) {
  const { selectionType, insideOutsideType, position } = target;
  const newSelection = selectionWithEditorFromRange(
    selection,
    getDocumentRange(selection.editor.document)
  );

  return {
    selection: newSelection,
    selectionType,
    position,
    insideOutsideType,
    selectionContext,
  };
}

function processLine(
  target: PrimitiveTarget,
  selection: SelectionWithEditor,
  selectionContext: SelectionContext
) {
  const { selectionType, insideOutsideType, position } = target;
  const { document } = selection.editor;
  const startLine = document.lineAt(selection.selection.start);
  const endLine = document.lineAt(selection.selection.end);
  const start = new Position(
    startLine.lineNumber,
    startLine.firstNonWhitespaceCharacterIndex
  );
  const end = endLine.range.end;

  const newSelection = selectionWithEditorFromPositions(selection, start, end);

  return {
    selection: newSelection,
    selectionType,
    position,
    insideOutsideType,
    selectionContext: getLineSelectionContext(newSelection),
  };
}

function processParagraph(
  target: PrimitiveTarget,
  selection: SelectionWithEditor,
  selectionContext: SelectionContext
) {
  const { selectionType, insideOutsideType, position } = target;
  const { document } = selection.editor;
  let startLine = document.lineAt(selection.selection.start);
  if (!startLine.isEmptyOrWhitespace) {
    while (startLine.lineNumber > 0) {
      const line = document.lineAt(startLine.lineNumber - 1);
      if (line.isEmptyOrWhitespace) {
        break;
      }
      startLine = line;
    }
  }
  const lineCount = document.lineCount;
  let endLine = document.lineAt(selection.selection.end);
  if (!endLine.isEmptyOrWhitespace) {
    while (endLine.lineNumber + 1 < lineCount) {
      const line = document.lineAt(endLine.lineNumber + 1);
      if (line.isEmptyOrWhitespace) {
        break;
      }
      endLine = line;
    }
  }

  const start = new Position(
    startLine.lineNumber,
    startLine.firstNonWhitespaceCharacterIndex
  );
  const end = endLine.range.end;

  const newSelection = selectionWithEditorFromPositions(selection, start, end);

  return {
    selection: newSelection,
    position,
    selectionType,
    insideOutsideType,
    selectionContext: getParagraphSelectionContext(newSelection),
  };
}

function getTokenSelectionContext(
  selection: SelectionWithEditor,
  modifier: Modifier,
  position: TargetPosition,
  insideOutsideType: InsideOutsideType,
  selectionContext: SelectionContext
): SelectionContext {
  if (!isSelectionContextEmpty(selectionContext)) {
    return selectionContext;
  }
  if (modifier.type === "subpiece") {
    return selectionContext;
  }

  const document = selection.editor.document;
  const { start, end } = selection.selection;
  const endLine = document.lineAt(end);
  let leadingDelimiterRange, trailingDelimiterRange;

  // Positions start/end of has no delimiters
  if (position !== "before" || insideOutsideType !== "inside") {
    const startLine = document.lineAt(start);
    const leadingText = startLine.text.slice(0, start.character);
    const leadingDelimiters = leadingText.match(/\s+$/);
    leadingDelimiterRange =
      leadingDelimiters != null
        ? new Range(
            start.line,
            start.character - leadingDelimiters[0].length,
            start.line,
            start.character
          )
        : null;
  }

  if (position !== "after" || insideOutsideType !== "inside") {
    const trailingText = endLine.text.slice(end.character);
    const trailingDelimiters = trailingText.match(/^\s+/);
    trailingDelimiterRange =
      trailingDelimiters != null
        ? new Range(
            end.line,
            end.character,
            end.line,
            end.character + trailingDelimiters[0].length
          )
        : null;
  }

  let isInDelimitedList;
  if (position === "contents") {
    isInDelimitedList =
      (leadingDelimiterRange != null || trailingDelimiterRange != null) &&
      (leadingDelimiterRange != null || start.character === 0) &&
      (trailingDelimiterRange != null || end.isEqual(endLine.range.end));
  } else {
    isInDelimitedList =
      leadingDelimiterRange != null || trailingDelimiterRange != null;
  }

  return {
    ...selectionContext,
    isInDelimitedList,
    containingListDelimiter: " ",
    leadingDelimiterRange: isInDelimitedList ? leadingDelimiterRange : null,
    trailingDelimiterRange: isInDelimitedList ? trailingDelimiterRange : null,
  };
}

// TODO Clean this up once we have rich targets and better polymorphic
// selection contexts that indicate their type
function isSelectionContextEmpty(selectionContext: SelectionContext) {
  return (
    selectionContext.isInDelimitedList == null &&
    selectionContext.containingListDelimiter == null &&
    selectionContext.leadingDelimiterRange == null &&
    selectionContext.trailingDelimiterRange == null
  );
}

function getLineSelectionContext(
  selection: SelectionWithEditor
): SelectionContext {
  const { document } = selection.editor;
  const { start, end } = selection.selection;
  const outerSelection = getOuterSelection(selection, start, end);

  const leadingDelimiterRange =
    start.line > 0
      ? new Range(
          document.lineAt(start.line - 1).range.end,
          outerSelection.start
        )
      : null;
  const trailingDelimiterRange =
    end.line + 1 < document.lineCount
      ? new Range(outerSelection.end, new Position(end.line + 1, 0))
      : null;
  const isInDelimitedList =
    leadingDelimiterRange != null || trailingDelimiterRange != null;

  return {
    isInDelimitedList,
    containingListDelimiter: "\n",
    leadingDelimiterRange,
    trailingDelimiterRange,
    outerSelection,
  };
}

function getParagraphSelectionContext(
  selection: SelectionWithEditor
): SelectionContext {
  const { document } = selection.editor;
  const { start, end } = selection.selection;
  const outerSelection = getOuterSelection(selection, start, end);
  const leadingLine = getPreviousNonEmptyLine(document, start.line);
  const trailingLine = getNextNonEmptyLine(document, end.line);

  const leadingDelimiterStart =
    leadingLine != null
      ? leadingLine.range.end
      : start.line > 0
      ? new Position(0, 0)
      : null;
  const trailingDelimiterEnd =
    trailingLine != null
      ? trailingLine.range.start
      : end.line < document.lineCount - 1
      ? document.lineAt(document.lineCount - 1).range.end
      : null;
  const leadingDelimiterRange =
    leadingDelimiterStart != null
      ? new Range(leadingDelimiterStart, outerSelection.start)
      : null;
  const trailingDelimiterRange =
    trailingDelimiterEnd != null
      ? new Range(outerSelection.end, trailingDelimiterEnd)
      : null;
  const isInDelimitedList =
    leadingDelimiterRange != null || trailingDelimiterRange != null;

  return {
    isInDelimitedList,
    containingListDelimiter: "\n\n",
    leadingDelimiterRange,
    trailingDelimiterRange,
    outerSelection,
  };
}

function getOuterSelection(
  selection: SelectionWithEditor,
  start: Position,
  end: Position
) {
  // Outer selection contains the entire lines
  return selectionFromPositions(
    selection.selection,
    new Position(start.line, 0),
    selection.editor.document.lineAt(end).range.end
  );
}

function getPreviousNonEmptyLine(
  document: TextDocument,
  startLineNumber: number
) {
  let line = document.lineAt(startLineNumber);
  while (line.lineNumber > 0) {
    const previousLine = document.lineAt(line.lineNumber - 1);
    if (!previousLine.isEmptyOrWhitespace) {
      return previousLine;
    }
    line = previousLine;
  }
  return null;
}

function getNextNonEmptyLine(document: TextDocument, startLineNumber: number) {
  let line = document.lineAt(startLineNumber);
  while (line.lineNumber + 1 < document.lineCount) {
    const nextLine = document.lineAt(line.lineNumber + 1);
    if (!nextLine.isEmptyOrWhitespace) {
      return nextLine;
    }
    line = nextLine;
  }
  return null;
}
