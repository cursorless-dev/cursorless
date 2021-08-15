import { SyntaxNode, Point } from "web-tree-sitter";
import { Position, Range, Selection, TextEditor } from "vscode";
import { SelectionWithContext, SelectionExtractor } from "../typings/Types";

export function makeRange(startPosition: Point, endPosition: Point) {
  return new Range(
    new Position(startPosition.row, startPosition.column),
    new Position(endPosition.row, endPosition.column)
  );
}

export function simpleSelectionExtractor(
  editor: TextEditor,
  node: SyntaxNode
): SelectionWithContext {
  return {
    selection: new Selection(
      new Position(node.startPosition.row, node.startPosition.column),
      new Position(node.endPosition.row, node.endPosition.column)
    ),
    context: {},
  };
}

export function argumentSelectionExtractor(): SelectionExtractor {
  return delimitedSelector(
    (node) =>
      node.type === "," ||
      node.type === "(" ||
      node.type === ")" ||
      node.type === "[" ||
      node.type === "]" ||
      node.type === "}" ||
      node.type === "{",
    ", "
  );
}

export function selectWithLeadingDelimiter(
  editor: TextEditor,
  node: SyntaxNode
): SelectionWithContext {
  const leadingDelimiterToken = node.previousSibling!;

  const leadingDelimiterRange = makeRange(
    leadingDelimiterToken.startPosition,
    node.startPosition
  );

  return {
    ...simpleSelectionExtractor(editor, node),
    context: {
      leadingDelimiterRange,
    },
  };
}

function getNextNonDelimiterNode(
  startNode: SyntaxNode,
  isDelimiterNode: (node: SyntaxNode) => boolean
): SyntaxNode | null {
  let node = startNode.nextSibling;

  while (node != null) {
    if (!isDelimiterNode(node)) {
      return node;
    }

    node = node.nextSibling;
  }

  return node;
}

function getPreviousNonDelimiterNode(
  startNode: SyntaxNode,
  isDelimiterNode: (node: SyntaxNode) => boolean
): SyntaxNode | null {
  let node = startNode.previousSibling;

  while (node != null) {
    if (!isDelimiterNode(node)) {
      return node;
    }

    node = node.previousSibling;
  }

  return node;
}

export function delimitersSelector(...delimiters: string[]) {
  return delimitedSelector((node) => delimiters.includes(node.type), ", ");
}

export function delimitedSelector(
  isDelimiterNode: (node: SyntaxNode) => boolean,
  defaultDelimiter: string
): SelectionExtractor {
  return (editor: TextEditor, node: SyntaxNode) => {
    var containingListDelimiter: string | null = null;
    var leadingDelimiterRange: Range | null = null;
    var trailingDelimiterRange: Range | null = null;

    const nextNonDelimiterNode = getNextNonDelimiterNode(node, isDelimiterNode);
    const previousNonDelimiterNode = getPreviousNonDelimiterNode(
      node,
      isDelimiterNode
    );

    if (nextNonDelimiterNode != null) {
      trailingDelimiterRange = makeRange(
        node.endPosition,
        nextNonDelimiterNode.startPosition
      );

      containingListDelimiter = editor.document.getText(trailingDelimiterRange);
    }

    if (previousNonDelimiterNode != null) {
      leadingDelimiterRange = makeRange(
        previousNonDelimiterNode.endPosition,
        node.startPosition
      );

      if (containingListDelimiter == null) {
        containingListDelimiter = editor.document.getText(
          leadingDelimiterRange
        );
      }
    }

    if (containingListDelimiter == null) {
      containingListDelimiter = defaultDelimiter;
    }

    return {
      ...simpleSelectionExtractor(editor, node),
      context: {
        isInDelimitedList: true,
        containingListDelimiter,
        leadingDelimiterRange,
        trailingDelimiterRange,
      },
    };
  };
}
