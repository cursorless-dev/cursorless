import { concat, zip } from "lodash";
import { Position, Range, Selection, TextDocument } from "vscode";
import { performInsideOutsideAdjustment } from "../performInsideOutsideAdjustment";
import {
  selectionFromPositions,
  selectionWithEditorFromPositions,
} from "../selectionUtils";
import {
  LineNumberPosition,
  Mark,
  Modifier,
  PrimitiveTarget,
  ProcessedTargetsContext,
  RangeTarget,
  SelectionContext,
  SelectionWithEditor,
  Target,
  TypedSelection,
} from "../Types";
import processModifier from "./processModifier";

export default function (
  context: ProcessedTargetsContext,
  targets: Target[]
): TypedSelection[][] {
  return targets.map((target) => processTarget(context, target));
}

function processTarget(
  context: ProcessedTargetsContext,
  target: Target
): TypedSelection[] {
  switch (target.type) {
    case "list":
      return target.elements.flatMap((element) =>
        processNonListTarget(context, element)
      );
    case "range":
    case "primitive":
      return processNonListTarget(context, target);
  }
}

function processNonListTarget(
  context: ProcessedTargetsContext,
  target: RangeTarget | PrimitiveTarget
): TypedSelection[] {
  let selections;
  switch (target.type) {
    case "range":
      selections = processRangeTarget(context, target);
      break;
    case "primitive":
      selections = processPrimitiveTarget(context, target);
      break;
  }
  return selections.map((selection) =>
    performInsideOutsideAdjustment(selection)
  );
}

function processRangeTarget(
  context: ProcessedTargetsContext,
  target: RangeTarget
): TypedSelection[] {
  const anchorTargets = processPrimitiveTarget(context, target.start);
  const activeTargets = processPrimitiveTarget(context, target.end);

  if (anchorTargets.length !== activeTargets.length) {
    throw new Error("anchorTargets and activeTargets lengths don't match");
  }

  return zip(anchorTargets, activeTargets).map(
    ([anchorTarget, activeTarget]) => {
      if (anchorTarget!.selection.editor !== activeTarget!.selection.editor) {
        throw new Error(
          "anchorTarget and activeTarget must be in same document"
        );
      }

      const anchorSelection = anchorTarget!.selection.selection;
      const activeSelection = activeTarget!.selection.selection;

      const isStartBeforeEnd = anchorSelection.start.isBeforeOrEqual(
        activeSelection.start
      );

      const anchor = targetToRangeLimitPosition(
        anchorTarget!,
        isStartBeforeEnd,
        target.excludeStart
      );
      const active = targetToRangeLimitPosition(
        activeTarget!,
        !isStartBeforeEnd,
        target.excludeEnd
      );

      const outerAnchor = target.excludeStart
        ? null
        : isStartBeforeEnd
        ? anchorTarget!.selectionContext.outerSelection?.start
        : anchorTarget!.selectionContext.outerSelection?.end;
      const outerActive = target.excludeEnd
        ? null
        : isStartBeforeEnd
        ? activeTarget!.selectionContext.outerSelection?.end
        : activeTarget!.selectionContext.outerSelection?.start;
      const outerSelection =
        outerAnchor != null || outerActive != null
          ? new Selection(outerAnchor ?? anchor, outerActive ?? active)
          : null;

      const startSelectionContext = target.excludeStart
        ? null
        : anchorTarget!.selectionContext;
      const endSelectionContext = target.excludeEnd
        ? null
        : activeTarget!.selectionContext;
      const leadingDelimiterRange = isStartBeforeEnd
        ? startSelectionContext?.leadingDelimiterRange
        : endSelectionContext?.leadingDelimiterRange;
      const trailingDelimiterRange = isStartBeforeEnd
        ? endSelectionContext?.trailingDelimiterRange
        : startSelectionContext?.trailingDelimiterRange;

      return {
        selection: {
          selection: new Selection(anchor, active),
          editor: anchorTarget!.selection.editor,
        },
        selectionType: anchorTarget!.selectionType,
        selectionContext: {
          containingListDelimiter:
            anchorTarget!.selectionContext.containingListDelimiter,
          isInDelimitedList: anchorTarget!.selectionContext.isInDelimitedList,
          leadingDelimiterRange,
          trailingDelimiterRange,
          outerSelection,
        },
        insideOutsideType: anchorTarget!.insideOutsideType,
        position: "contents",
      };
    }
  );
}

/**
 * Given a target which forms one end of a range target, do necessary
 * adjustments to get the proper position for the output range
 * @param target The target to get position from
 * @param isStart If true this position is the start of the range
 * @param exclude If true the content of this position should be excluded
 */
function targetToRangeLimitPosition(
  target: TypedSelection,
  isStart: boolean,
  exclude: boolean
) {
  const selection = target.selection.selection;
  if (exclude) {
    const outerSelection = target!.selectionContext.outerSelection;
    const delimiterPosition = isStart
      ? target.selectionContext.trailingDelimiterRange?.end
      : target.selectionContext.leadingDelimiterRange?.start;
    if (outerSelection != null) {
      if (delimiterPosition != null) {
        return delimiterPosition;
      }
      return isStart ? outerSelection.end : outerSelection.start;
    }
    return isStart ? selection.end : selection.start;
  }
  return isStart ? selection.start : selection.end;
}

function processPrimitiveTarget(
  context: ProcessedTargetsContext,
  target: PrimitiveTarget
): TypedSelection[] {
  const markSelections = getSelectionsFromMark(context, target.mark);
  const transformedSelections = concat(
    [],
    ...markSelections.map((markSelection) =>
      processModifier(context, target, markSelection)
    )
  );

  const typedSelections = transformedSelections.map(
    ({ selection, context: selectionContext }) =>
      createTypedSelection(context, target, selection, selectionContext)
  );
  return typedSelections.map((selection) =>
    performPositionAdjustment(context, target, selection)
  );
}

function getSelectionsFromMark(
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

    case "cursorToken": {
      const tokens = context.currentSelections.map((selection) => {
        const token = context.navigationMap.getTokenForRange(
          selection.selection
        );
        if (token == null) {
          throw new Error("Couldn't find mark under cursor");
        }
        return token;
      });
      return tokens.map((token) => ({
        selection: new Selection(token.range.start, token.range.end),
        editor: token.editor,
      }));
    }

    case "decoratedSymbol":
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

    case "lineNumber": {
      const getLine = (linePosition: LineNumberPosition) =>
        linePosition.isRelative
          ? context.currentEditor!.selection.active.line +
            linePosition.lineNumber
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

    case "lastCursorPosition":
      throw new Error("Not implemented");
  }
}

function createTypedSelection(
  context: ProcessedTargetsContext,
  target: PrimitiveTarget,
  selection: SelectionWithEditor,
  selectionContext: SelectionContext
): TypedSelection {
  const { selectionType, insideOutsideType, position, modifier } = target;
  const { document } = selection.editor;

  switch (selectionType) {
    case "token":
      return {
        selection,
        selectionType,
        position,
        insideOutsideType,
        selectionContext: getTokenSelectionContext(
          selection,
          modifier,
          selectionContext
        ),
      };

    case "line": {
      const startLine = document.lineAt(selection.selection.start);
      const endLine = document.lineAt(selection.selection.end);
      const start = new Position(
        startLine.lineNumber,
        startLine.firstNonWhitespaceCharacterIndex
      );
      const end = endLine.range.end;

      const newSelection = selectionWithEditorFromPositions(
        selection,
        start,
        end
      );

      return {
        selection: newSelection,
        selectionType,
        position,
        insideOutsideType,
        selectionContext: getLineSelectionContext(newSelection),
      };
    }

    case "document": {
      const firstLine = document.lineAt(0);
      const lastLine = document.lineAt(document.lineCount - 1);
      const start = firstLine.range.start;
      const end = lastLine.range.end;
      const newSelection = selectionWithEditorFromPositions(
        selection,
        start,
        end
      );

      return {
        selection: newSelection,
        selectionType,
        position,
        insideOutsideType,
        selectionContext,
      };
    }

    case "paragraph": {
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

      const newSelection = selectionWithEditorFromPositions(
        selection,
        start,
        end
      );

      return {
        selection: newSelection,
        position,
        selectionType,
        insideOutsideType,
        selectionContext: getParagraphSelectionContext(newSelection),
      };
    }

    case "character":
      throw new Error("Not implemented");
  }
}

function performPositionAdjustment(
  context: ProcessedTargetsContext,
  target: PrimitiveTarget,
  selection: TypedSelection
): TypedSelection {
  var newSelection;
  const { position } = target;
  const originalSelection = selection.selection.selection;

  switch (position) {
    case "contents":
      newSelection = originalSelection;
      break;
    case "before":
      newSelection = new Selection(
        originalSelection.start,
        originalSelection.start
      );
      break;
    case "after":
      newSelection = new Selection(
        originalSelection.end,
        originalSelection.end
      );
      break;
  }

  return {
    selection: {
      selection: newSelection,
      editor: selection.selection.editor,
    },
    selectionType: selection.selectionType,
    selectionContext: selection.selectionContext,
    insideOutsideType: target.insideOutsideType ?? null,
    position,
  };
}

function getTokenSelectionContext(
  selection: SelectionWithEditor,
  modifier: Modifier,
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

  const startLine = document.lineAt(start);
  const leadingText = startLine.text.slice(0, start.character);
  const leadingDelimiters = leadingText.match(/\s+$/);
  const leadingDelimiterRange =
    leadingDelimiters != null
      ? new Range(
          start.line,
          start.character - leadingDelimiters[0].length,
          start.line,
          start.character
        )
      : null;

  const endLine = document.lineAt(end);
  const trailingText = endLine.text.slice(end.character);
  const trailingDelimiters = trailingText.match(/^\s+/);
  const trailingDelimiterRange =
    trailingDelimiters != null
      ? new Range(
          end.line,
          end.character,
          end.line,
          end.character + trailingDelimiters[0].length
        )
      : null;

  const isInDelimitedList =
    (leadingDelimiterRange != null || trailingDelimiterRange != null) &&
    (leadingDelimiterRange != null || start.character === 0) &&
    (trailingDelimiterRange != null || end.isEqual(endLine.range.end));

  return {
    isInDelimitedList,
    containingListDelimiter: " ",
    leadingDelimiterRange: isInDelimitedList ? leadingDelimiterRange : null,
    trailingDelimiterRange: isInDelimitedList ? trailingDelimiterRange : null,
    outerSelection: selectionContext.outerSelection,
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
