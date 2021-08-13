import update from "immutability-helper";
import { concat, isEqual, range, zip } from "lodash";
import * as vscode from "vscode";
import { Location, Position, Range, Selection, TextDocument } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { SUBWORD_MATCHER } from "./constants";
import { getNodeMatcher } from "./languages";
import { createSurroundingPairMatcher } from "./languages/surroundingPair";
import { performInsideOutsideAdjustment } from "./performInsideOutsideAdjustment";
import {
  selectionFromPositions,
  selectionWithEditorFromPositions,
  selectionWithEditorFromRange,
} from "./selectionUtils";
import {
  LineNumberPosition,
  Mark,
  Modifier,
  NodeMatcher,
  PrimitiveTarget,
  ProcessedTargetsContext,
  RangeTarget,
  SelectionContext,
  SelectionWithEditor,
  Target,
  TypedSelection,
} from "./Types";

export default function processTargets(
  context: ProcessedTargetsContext,
  targets: Target[]
): TypedSelection[][] {
  return targets.map((target) => processSingleTarget(context, target));
}

function processSingleTarget(
  context: ProcessedTargetsContext,
  target: Target
): TypedSelection[] {
  switch (target.type) {
    case "list":
      return concat(
        [],
        ...target.elements.map((target) => processSingleTarget(context, target))
      );
    case "range":
      return processSingleRangeTarget(context, target).map((selection) =>
        performInsideOutsideAdjustment(selection)
      );
    case "primitive":
      return processSinglePrimitiveTarget(context, target).map((selection) =>
        performInsideOutsideAdjustment(selection)
      );
  }
}

function processSingleRangeTarget(
  context: ProcessedTargetsContext,
  target: RangeTarget
): TypedSelection[] {
  const startTargets = processSinglePrimitiveTarget(context, target.start);
  const endTargets = processSinglePrimitiveTarget(context, target.end);

  if (startTargets.length !== endTargets.length) {
    throw new Error("startTargets and endTargets lengths don't match");
  }

  return zip(startTargets, endTargets).map(([startTarget, endTarget]) => {
    if (startTarget!.selection.editor !== endTarget!.selection.editor) {
      throw new Error("startTarget and endTarget must be in same document");
    }

    const startSelection = startTarget!.selection.selection;
    const endSelection = endTarget!.selection.selection;

    const isStartBeforeEnd = startSelection.start.isBeforeOrEqual(
      endSelection.start
    );

    const anchor = targetToRangeLimitPosition(
      startTarget!,
      isStartBeforeEnd,
      target.excludeStart
    );
    const active = targetToRangeLimitPosition(
      endTarget!,
      !isStartBeforeEnd,
      target.excludeEnd
    );

    const outerAnchor = target.excludeStart
      ? null
      : isStartBeforeEnd
      ? startTarget!.selectionContext.outerSelection?.start
      : startTarget!.selectionContext.outerSelection?.end;
    const outerActive = target.excludeEnd
      ? null
      : isStartBeforeEnd
      ? endTarget!.selectionContext.outerSelection?.end
      : endTarget!.selectionContext.outerSelection?.start;
    const outerSelection =
      outerAnchor != null || outerActive != null
        ? new Selection(outerAnchor ?? anchor, outerActive ?? active)
        : null;

    const startSelectionContext = target.excludeStart
      ? null
      : startTarget!.selectionContext;
    const endSelectionContext = target.excludeEnd
      ? null
      : endTarget!.selectionContext;
    const leadingDelimiterRange = isStartBeforeEnd
      ? startSelectionContext?.leadingDelimiterRange
      : endSelectionContext?.leadingDelimiterRange;
    const trailingDelimiterRange = isStartBeforeEnd
      ? endSelectionContext?.trailingDelimiterRange
      : startSelectionContext?.trailingDelimiterRange;

    return {
      selection: {
        selection: new Selection(anchor, active),
        editor: startTarget!.selection.editor,
      },
      selectionType: startTarget!.selectionType,
      selectionContext: {
        containingListDelimiter:
          startTarget!.selectionContext.containingListDelimiter,
        isInDelimitedList: startTarget!.selectionContext.isInDelimitedList,
        leadingDelimiterRange,
        trailingDelimiterRange,
        outerSelection,
      },
      insideOutsideType: startTarget!.insideOutsideType,
      position: "contents",
    };
  });
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

function processSinglePrimitiveTarget(
  context: ProcessedTargetsContext,
  target: PrimitiveTarget
): TypedSelection[] {
  const markSelections = getSelectionsFromMark(context, target.mark);
  const transformedSelections = concat(
    [],
    ...markSelections.map((markSelection) =>
      transformSelection(context, target, markSelection)
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

function findNearestContainingAncestorNode(
  startNode: SyntaxNode,
  nodeMatcher: NodeMatcher,
  selection: SelectionWithEditor
) {
  let node: SyntaxNode | null = startNode;
  while (node != null) {
    const matches = nodeMatcher(selection, node);
    if (matches != null) {
      return matches
        .map((match) => match.selection)
        .map((matchedSelection) => ({
          selection: selectionWithEditorFromRange(
            selection,
            matchedSelection.selection
          ),
          context: matchedSelection.context,
        }));
    }
    node = node.parent;
  }

  return null;
}

function transformSelection(
  context: ProcessedTargetsContext,
  target: PrimitiveTarget,
  selection: SelectionWithEditor
): { selection: SelectionWithEditor; context: SelectionContext }[] {
  const { modifier } = target;

  switch (modifier.type) {
    case "identity":
      return [{ selection, context: {} }];

    case "containingScope":
      const nodeMatcher = getNodeMatcher(
        selection.editor.document.languageId,
        modifier.scopeType,
        modifier.includeSiblings ?? false
      );
      let node: SyntaxNode | null = context.getNodeAtLocation(
        new Location(selection.editor.document.uri, selection.selection)
      );

      let result = findNearestContainingAncestorNode(
        node,
        nodeMatcher,
        selection
      );

      if (result != null) {
        return result;
      }

      throw new Error(`Couldn't find containing ${modifier.scopeType}`);

    case "subpiece":
      const token = selection.editor.document.getText(selection.selection);
      let pieces: { start: number; end: number }[] = [];

      if (modifier.pieceType === "word") {
        pieces = [...token.matchAll(SUBWORD_MATCHER)].map((match) => ({
          start: match.index!,
          end: match.index! + match[0].length,
        }));
      } else if (modifier.pieceType === "character") {
        pieces = range(token.length).map((index) => ({
          start: index,
          end: index + 1,
        }));
      }

      const anchorIndex =
        modifier.anchor < 0 ? modifier.anchor + pieces.length : modifier.anchor;
      const activeIndex =
        modifier.active < 0 ? modifier.active + pieces.length : modifier.active;

      const isReversed = activeIndex < anchorIndex;

      const anchor = selection.selection.start.translate(
        undefined,
        isReversed ? pieces[anchorIndex].end : pieces[anchorIndex].start
      );
      const active = selection.selection.start.translate(
        undefined,
        isReversed ? pieces[activeIndex].start : pieces[activeIndex].end
      );

      const startIndex = Math.min(anchorIndex, activeIndex);
      const endIndex = Math.max(anchorIndex, activeIndex);
      const leadingDelimiterRange =
        startIndex > 0 && pieces[startIndex - 1].end < pieces[startIndex].start
          ? new Range(
              selection.selection.start.translate({
                characterDelta: pieces[startIndex - 1].end,
              }),
              selection.selection.start.translate({
                characterDelta: pieces[startIndex].start,
              })
            )
          : null;
      const trailingDelimiterRange =
        endIndex + 1 < pieces.length &&
        pieces[endIndex].end < pieces[endIndex + 1].start
          ? new Range(
              selection.selection.start.translate({
                characterDelta: pieces[endIndex].end,
              }),
              selection.selection.start.translate({
                characterDelta: pieces[endIndex + 1].start,
              })
            )
          : null;
      const isInDelimitedList =
        leadingDelimiterRange != null || trailingDelimiterRange != null;
      const containingListDelimiter = isInDelimitedList
        ? selection.editor.document.getText(
            (leadingDelimiterRange ?? trailingDelimiterRange)!
          )
        : null;

      return [
        {
          selection: update(selection, {
            selection: () => new Selection(anchor, active),
          }),
          context: {
            isInDelimitedList,
            containingListDelimiter: containingListDelimiter ?? undefined,
            leadingDelimiterRange,
            trailingDelimiterRange,
          },
        },
      ];

    case "head":
    case "tail": {
      let anchor: Position, active: Position;
      if (modifier.type === "head") {
        anchor = selection.selection.end;
        active = new Position(selection.selection.start.line, 0);
      } else {
        anchor = selection.selection.start;
        active = selection.editor.document.lineAt(selection.selection.end).range
          .end;
      }
      return [
        {
          selection: update(selection, {
            selection: () => new Selection(anchor, active),
          }),
          context: {},
        },
      ];
    }

    case "matchingPairSymbol":
      throw new Error("Not implemented");

    case "surroundingPair":
      {
        let node: SyntaxNode | null = context.getNodeAtLocation(
          new vscode.Location(
            selection.editor.document.uri,
            selection.selection
          )
        );

        const nodeMatcher = createSurroundingPairMatcher(
          modifier.delimiter,
          modifier.delimiterInclusion
        );
        let result = findNearestContainingAncestorNode(
          node,
          nodeMatcher,
          selection
        );
        if (result != null) {
          return result;
        }
      }

      throw new Error(`Couldn't find containing `);
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
  return isEqual(selectionContext, {});
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
