import { concat, range, zip } from "lodash";
import update from "immutability-helper";
import { SyntaxNode } from "web-tree-sitter";
import { Selection, Range, Position, Location } from "vscode";
import { nodeMatchers } from "./languages";
import {
  Mark,
  PrimitiveTarget,
  ProcessedTargetsContext,
  RangeTarget,
  SelectionContext,
  SelectionWithContext,
  SelectionWithEditor,
  Target,
  TypedSelection,
  Modifier,
} from "./Types";
import { performInsideOutsideAdjustment } from "./performInsideOutsideAdjustment";
import { SUBWORD_MATCHER } from "./constants";
import { selectionWithEditorFromPositions } from "./selectionUtils";

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
    case "that":
      return context.thatMark;
    case "source":
      return context.sourceMark;
    case "lastCursorPosition":
      throw new Error("Not implemented");
  }
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
      var node: SyntaxNode | null = context.getNodeAtLocation(
        new Location(selection.editor.document.uri, selection.selection)
      );

      const nodeMatcher =
        nodeMatchers[selection.editor.document.languageId][modifier.scopeType];

      while (node != null) {
        const matchedSelection = nodeMatcher(selection.editor, node);
        if (matchedSelection != null) {
          var matchedSelections: SelectionWithContext[];
          if (modifier.includeSiblings) {
            matchedSelections = node
              .parent!.children.map((sibling) =>
                nodeMatcher(selection.editor, sibling)
              )
              .filter(
                (selection) => selection != null
              ) as SelectionWithContext[];
          } else {
            matchedSelections = [matchedSelection];
          }
          return matchedSelections.map((matchedSelection) => ({
            selection: {
              editor: selection.editor,
              selection: matchedSelection.selection,
            },
            context: matchedSelection.context,
          }));
        }
        node = node.parent;
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
    case "matchingPairSymbol":
    case "surroundingPair":
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
      while (startLine.lineNumber > 0) {
        const line = document.lineAt(startLine.lineNumber - 1);
        if (line.isEmptyOrWhitespace) {
          break;
        }
        startLine = line;
      }
      const lineCount = document.lineCount;
      let endLine = document.lineAt(selection.selection.end);
      while (endLine.lineNumber + 1 < lineCount) {
        const line = document.lineAt(endLine.lineNumber + 1);
        if (line.isEmptyOrWhitespace) {
          break;
        }
        endLine = line;
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

  const document = selection.editor.document;
  const { start, end } = selection.selection;

  const startLine = document.lineAt(start);
  const leadingText = startLine.text.slice(0, start.character);
  const hasLeadingSibling = leadingText.trim().length > 0;
  const leadingDelimiters = leadingText.match(/\s+$/);
  const leadingDelimiterRange =
    hasLeadingSibling && leadingDelimiters != null
      ? new Range(
          start.line,
          start.character - leadingDelimiters[0].length,
          start.line,
          start.character
        )
      : null;

  const endLine = document.lineAt(end);
  const trailingText = endLine.text.slice(end.character);
  const hasTrailingSibling = trailingText.trim().length > 0;
  const trailingDelimiters = trailingText.match(/^\s+/);
  const trailingDelimiterRange =
    hasTrailingSibling && trailingDelimiters != null
      ? new Range(
          end.line,
          end.character,
          end.line,
          end.character + trailingDelimiters[0].length
        )
      : null;

  if (
    leadingDelimiterRange != null ||
    trailingDelimiterRange != null ||
    modifier.type !== "subpiece"
  ) {
    return {
      isInDelimitedList: true,
      containingListDelimiter: " ",
      leadingDelimiterRange,
      trailingDelimiterRange,
    };
  }

  return selectionContext;
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
  const start = selection.selection.start;
  const end = selection.selection.end;

  const leadingDelimiterRange =
    start.line > 0
      ? new Range(
          start.line - 1,
          document.lineAt(start.line - 1).range.end.character,
          start.line,
          start.character
        )
      : null;

  const trailingDelimiterRange =
    end.line + 1 < document.lineCount
      ? new Range(end.line, end.character, end.line + 1, 0)
      : null;

  // Outer selection contains the entire lines
  const outerSelection = new Selection(
    start.line,
    0,
    end.line,
    selection.editor.document.lineAt(end.line).range.end.character
  );

  const isInDelimitedList =
    leadingDelimiterRange != null || trailingDelimiterRange != null;

  return {
    isInDelimitedList,
    containingListDelimiter: isInDelimitedList ? "\n" : undefined,
    leadingDelimiterRange,
    trailingDelimiterRange,
    outerSelection,
  };
}

function getParagraphSelectionContext(
  selection: SelectionWithEditor
): SelectionContext {
  const { document } = selection.editor;
  const start = selection.selection.start;
  const end = selection.selection.end;

  let leadingLine = document.lineAt(selection.selection.start);
  while (leadingLine.lineNumber > 0) {
    leadingLine = document.lineAt(leadingLine.lineNumber - 1);
    if (!leadingLine.isEmptyOrWhitespace) {
      break;
    }
  }

  const lineCount = document.lineCount;
  let trailingLine = document.lineAt(selection.selection.end);
  while (trailingLine.lineNumber + 1 < lineCount) {
    trailingLine = document.lineAt(trailingLine.lineNumber + 1);
    if (!trailingLine.isEmptyOrWhitespace) {
      break;
    }
  }

  const leadingDelimiterRange =
    leadingLine.lineNumber !== start.line
      ? new Range(leadingLine.range.end, start)
      : null;
  const trailingDelimiterRange =
    trailingLine.lineNumber !== end.line
      ? new Range(end, trailingLine.range.start)
      : null;

  // Outer selection contains the entire lines
  const outerSelection = new Selection(
    start.line,
    0,
    end.line,
    selection.editor.document.lineAt(end.line).range.end.character
  );

  const isInDelimitedList =
    leadingDelimiterRange != null || trailingDelimiterRange != null;

  return {
    isInDelimitedList,
    containingListDelimiter: isInDelimitedList ? "\n\n" : undefined,
    leadingDelimiterRange,
    trailingDelimiterRange,
    outerSelection,
  };
}
