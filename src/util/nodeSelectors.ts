import { SyntaxNode, Point } from "web-tree-sitter";
import { Position, Range, Selection, TextEditor } from "vscode";
import { SelectionWithContext, SelectionExtractor } from "../typings/Types";

export function makeRangeFromPositions(
  startPosition: Point,
  endPosition: Point
) {
  return new Range(
    startPosition.row,
    startPosition.column,
    endPosition.row,
    endPosition.column
  );
}

export function positionFromPoint(point: Point): Position {
  return new Position(point.row, point.column);
}

export function getNodeRange(node: SyntaxNode) {
  return new Range(
    node.startPosition.row,
    node.startPosition.column,
    node.endPosition.row,
    node.endPosition.column
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

export function unwrapSelectionExtractor(
  editor: TextEditor,
  node: SyntaxNode
): SelectionWithContext {
  let startIndex = node.startIndex;
  let endIndex = node.endIndex;
  if (node.text.startsWith("(") && node.text.endsWith(")")) {
    startIndex += 1;
    endIndex -= 1;
  } else if (node.text.endsWith(";")) {
    endIndex -= 1;
  }
  return {
    selection: new Selection(
      editor.document.positionAt(startIndex),
      editor.document.positionAt(endIndex)
    ),
    context: {},
  };
}

export function selectWithLeadingDelimiter(...delimiters: string[]) {
  return function (editor: TextEditor, node: SyntaxNode): SelectionWithContext {
    const firstSibling = node.previousSibling;
    const secondSibling = firstSibling?.previousSibling;
    let leadingDelimiterRange;
    if (firstSibling) {
      if (delimiters.includes(firstSibling.type)) {
        // Second sibling exists. Terminate before it.
        if (secondSibling) {
          leadingDelimiterRange = makeRangeFromPositions(
            secondSibling.endPosition,
            node.startPosition
          );
        }
        // First delimiter sibling exists. Terminate after it.
        else {
          leadingDelimiterRange = makeRangeFromPositions(
            firstSibling.startPosition,
            node.startPosition
          );
        }
      }
      // First sibling exists but is not the delimiter we are looking for. Terminate before it.
      else {
        leadingDelimiterRange = makeRangeFromPositions(
          firstSibling.endPosition,
          node.startPosition
        );
      }
    }
    return {
      ...simpleSelectionExtractor(editor, node),
      context: {
        leadingDelimiterRange,
      },
    };
  };
}

export function selectWithTrailingDelimiter(...delimiters: string[]) {
  return function (editor: TextEditor, node: SyntaxNode): SelectionWithContext {
    const firstSibling = node.nextSibling;
    const secondSibling = firstSibling?.nextSibling;
    let trailingDelimiterRange;
    if (firstSibling) {
      if (delimiters.includes(firstSibling.type)) {
        if (secondSibling) {
          trailingDelimiterRange = makeRangeFromPositions(
            node.endPosition,
            secondSibling.startPosition
          );
        } else {
          trailingDelimiterRange = makeRangeFromPositions(
            node.endPosition,
            firstSibling.endPosition
          );
        }
      } else {
        trailingDelimiterRange = makeRangeFromPositions(
          node.endPosition,
          firstSibling.startPosition
        );
      }
    }
    return {
      ...simpleSelectionExtractor(editor, node),
      context: {
        trailingDelimiterRange,
      },
    };
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
    let containingListDelimiter: string | null = null;
    let leadingDelimiterRange: Range | null = null;
    let trailingDelimiterRange: Range | null = null;

    const nextNonDelimiterNode = getNextNonDelimiterNode(node, isDelimiterNode);
    const previousNonDelimiterNode = getPreviousNonDelimiterNode(
      node,
      isDelimiterNode
    );

    if (nextNonDelimiterNode != null) {
      trailingDelimiterRange = makeRangeFromPositions(
        node.endPosition,
        nextNonDelimiterNode.startPosition
      );

      containingListDelimiter = editor.document.getText(trailingDelimiterRange);
    }

    if (previousNonDelimiterNode != null) {
      leadingDelimiterRange = makeRangeFromPositions(
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
