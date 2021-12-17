import update from "immutability-helper";
import { range } from "lodash";
import { Location, Position, Range, Selection } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { SUBWORD_MATCHER } from "../../core/constants";
import { selectionWithEditorFromRange } from "../../util/selectionUtils";
import {
  ContainingScopeModifier,
  HeadModifier,
  NodeMatcher,
  PrimitiveTarget,
  ProcessedTargetsContext,
  RawSelectionModifier,
  SelectionContext,
  SelectionWithEditor,
  SubTokenModifier,
  TailModifier,
} from "../../typings/Types";
import { processSurroundingPair } from "./surroundingPair";
import { getNodeMatcher } from "../../languages/getNodeMatcher";

export type SelectionWithEditorWithContext = {
  selection: SelectionWithEditor;
  context: SelectionContext;
};

export default function (
  context: ProcessedTargetsContext,
  target: PrimitiveTarget,
  selection: SelectionWithEditor
): SelectionWithEditorWithContext[] {
  const { modifier } = target;
  let result;

  switch (modifier.type) {
    case "identity":
      result = [{ selection, context: {} }];
      break;

    case "containingScope":
      result = processScopeType(context, selection, modifier);
      break;

    case "subpiece":
      result = processSubToken(context, selection, modifier);
      break;

    case "head":
    case "tail":
      result = processHeadTail(context, selection, modifier);
      break;

    case "surroundingPair":
      result = processSurroundingPair(context, selection, modifier);
      break;

    case "toRawSelection":
      result = processRawSelectionModifier(context, selection, modifier);
      break;

    default:
      // Make sure we haven't missed any cases
      const neverCheck: never = modifier;
  }

  if (result == null) {
    throw new Error(`Couldn't find containing`);
  }

  return result;
}

function processScopeType(
  context: ProcessedTargetsContext,
  selection: SelectionWithEditor,
  modifier: ContainingScopeModifier
): SelectionWithEditorWithContext[] | null {
  const nodeMatcher = getNodeMatcher(
    selection.editor.document.languageId,
    modifier.scopeType,
    modifier.includeSiblings ?? false
  );
  const node: SyntaxNode | null = context.getNodeAtLocation(
    new Location(selection.editor.document.uri, selection.selection)
  );

  const result = findNearestContainingAncestorNode(
    node,
    nodeMatcher,
    selection
  );

  if (result == null) {
    throw new Error(`Couldn't find containing ${modifier.scopeType}`);
  }

  return result;
}

function processSubToken(
  context: ProcessedTargetsContext,
  selection: SelectionWithEditor,
  modifier: SubTokenModifier
): SelectionWithEditorWithContext[] | null {
  const token = selection.editor.document.getText(selection.selection);
  let pieces: { start: number; end: number }[] = [];

  if (modifier.excludeActive || modifier.excludeAnchor) {
    throw new Error("Subtoken exclusions unsupported");
  }

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

  if (
    anchorIndex < 0 ||
    activeIndex < 0 ||
    anchorIndex >= pieces.length ||
    activeIndex >= pieces.length
  ) {
    throw new Error("Subtoken index out of range");
  }

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
}

function processHeadTail(
  context: ProcessedTargetsContext,
  selection: SelectionWithEditor,
  modifier: HeadModifier | TailModifier
): SelectionWithEditorWithContext[] | null {
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

export function findNearestContainingAncestorNode(
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

function processRawSelectionModifier(
  context: ProcessedTargetsContext,
  selection: SelectionWithEditor,
  modifier: RawSelectionModifier
): SelectionWithEditorWithContext[] | null {
  return [
    {
      selection,
      context: { isRawSelection: true },
    },
  ];
}
