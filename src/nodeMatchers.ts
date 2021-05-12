import { SyntaxNode, Point } from "web-tree-sitter";
import { Position, Range, Selection, TextEditor } from "vscode";
import { SelectionWithContext, NodeMatcher } from "./Types";

export function hasType(...typeNames: string[]): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode) =>
    typeNames.includes(node.type) ? simpleSelectionExtractor(node) : null;
}

export const notSupported: NodeMatcher = (
  editor: TextEditor,
  node: SyntaxNode
) => {
  throw new Error("Node type not supported");
};

function getNextNonDelimiterNode(
  startNode: SyntaxNode,
  isDelimiterNode: (node: SyntaxNode) => boolean
): SyntaxNode | null {
  var node = startNode.nextSibling;

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
  var node = startNode.previousSibling;

  while (node != null) {
    if (!isDelimiterNode(node)) {
      return node;
    }

    node = node.previousSibling;
  }

  return node;
}

export function delimitedMatcher(
  nodeMatches: (node: SyntaxNode) => boolean,
  isDelimiterNode: (node: SyntaxNode) => boolean,
  defaultDelimiter: string
): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode) => {
    if (!nodeMatches(node)) {
      return null;
    }

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
      ...simpleSelectionExtractor(node),
      context: {
        isInDelimitedList: true,
        containingListDelimiter,
        leadingDelimiterRange,
        trailingDelimiterRange,
      },
    };
  };
}

export function makeRange(startPosition: Point, endPosition: Point) {
  return new Range(
    new Position(startPosition.row, startPosition.column),
    new Position(endPosition.row, endPosition.column)
  );
}

export function simpleSelectionExtractor(
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

/**
 * Creates a matcher that can match potentially wrapped nodes. For example
 * typescript export statements or python decorators
 * @param isWrapperNode Returns true if the given node has the right type to be
 * a wrapper node
 * @param isTargetNode Returns true if the given node has the right type to be
 * the target
 * @param getWrappedNode Given a wrapper node returns the given target node
 * @returns A matcher that will return the given target node or the wrapper
 * node, if it is wrapping a target node
 */
export function possiblyWrappedNode(
  isWrapperNode: (node: SyntaxNode) => boolean,
  isTargetNode: (node: SyntaxNode) => boolean,
  getWrappedNode: (node: SyntaxNode) => SyntaxNode | null
): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode) => {
    if (isWrapperNode(node.parent!)) {
      return null;
    }

    if (isWrapperNode(node) && isTargetNode(getWrappedNode(node)!)) {
      return simpleSelectionExtractor(node);
    }

    return isTargetNode(node) ? simpleSelectionExtractor(node) : null;
  };
}

/**
 * Create a new matcher by cascading the given matchers
 * @param matchers A list of matchers to try in sequence until one doesn't return null
 * @returns A NodeMatcher that tries the given matters in sequence
 */
export function cascadingMatcher(...matchers: NodeMatcher[]): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode) => {
    for (const matcher of matchers) {
      const match = matcher(editor, node);
      if (match != null) {
        return match;
      }
    }

    return null;
  };
}
