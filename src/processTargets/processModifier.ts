import update from "immutability-helper";
import { range } from "lodash";
import { Location, Position, Range, Selection } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { SUBWORD_MATCHER } from "../core/constants";
import { getNodeMatcher } from "../languages";
import {
  createSurroundingPairMatcher,
  findSurroundingPairTextBased,
} from "../languages/surroundingPair";
import { selectionWithEditorFromRange } from "../util/selectionUtils";
import {
  ContainingScopeModifier,
  HeadModifier,
  NodeMatcher,
  PrimitiveTarget,
  ProcessedTargetsContext,
  SelectionContext,
  SelectionWithEditor,
  SubTokenModifier,
  SurroundingPairModifier,
  TailModifier,
} from "../typings/Types";

type SelectionWithContext = {
  selection: SelectionWithEditor;
  context: SelectionContext;
};

export default function (
  context: ProcessedTargetsContext,
  target: PrimitiveTarget,
  selection: SelectionWithEditor
): SelectionWithContext[] {
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
): SelectionWithContext[] | null {
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
): SelectionWithContext[] | null {
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
): SelectionWithContext[] | null {
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

function processSurroundingPair(
  context: ProcessedTargetsContext,
  selection: SelectionWithEditor,
  modifier: SurroundingPairModifier
): SelectionWithContext[] | null {
  let node: SyntaxNode | null;
  try {
    node = context.getNodeAtLocation(
      new Location(selection.editor.document.uri, selection.selection)
    );
  } catch (err) {
    if ((err as Error).name === "UnsupportedLanguageError") {
      node = null;
    } else {
      throw err;
    }
  }
  if (node == null) {
    return findSurroundingPairTextBased(
      selection.editor.document.getText(selection.selection),
      selection.editor.document.offsetAt(selection.selection.start),
      selection.editor.document.offsetAt(selection.selection.end),
      modifier.delimiter,
      modifier.delimiterInclusion
    );
  }
  // TODO: If we are in a string or comment, switch to non parser based implementation
  const nodeMatcher = createSurroundingPairMatcher(
    modifier.delimiter,
    modifier.delimiterInclusion
  );
  return findNearestContainingAncestorNode(node, nodeMatcher, selection);
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
