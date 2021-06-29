import { SyntaxNode, Point } from "web-tree-sitter";
import { Position, Range, Selection, TextEditor } from "vscode";
import { SelectionWithContext, NodeMatcher } from "./Types";

export function hasType(...typeNames: string[]): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode) =>
    typeNames.includes(node.type) ? simpleSelectionExtractor(node) : null;
}

export function childNodeMatcher(
  getMatchingChildNode: (node: SyntaxNode) => SyntaxNode | null,
  extractor: (node: SyntaxNode) => SelectionWithContext
): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode) => {
    const returnNode = getMatchingChildNode(node);

    if (returnNode == null) {
      return null;
    }

    return extractor(returnNode);
  };
}

export function getNodeWithLeadingDelimiter(
  node: SyntaxNode
): SelectionWithContext {
  const leadingDelimiterToken = node.previousSibling!;

  const leadingDelimiterRange = makeRange(
    leadingDelimiterToken.startPosition,
    node.startPosition
  );

  return {
    ...simpleSelectionExtractor(node),
    context: {
      leadingDelimiterRange,
    },
  };
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
 * @param getWrappedNodes Given a wrapper node returns a list of possible
 * target nodes
 * @returns A matcher that will return the given target node or the wrapper
 * node, if it is wrapping a target node
 */
export function possiblyWrappedNode(
  isWrapperNode: (node: SyntaxNode) => boolean,
  isTargetNode: (node: SyntaxNode) => boolean,
  getWrappedNodes: (node: SyntaxNode) => (SyntaxNode | null)[]
): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode) => {
    if (node.parent != null && isWrapperNode(node.parent)) {
      // We don't want to return the target node if it is wrapped.  We return
      // null, knowing that the ancestor walk will call us again with the
      // wrapper node
      return null;
    }

    if (isWrapperNode(node)) {
      const isWrappingTargetNode = getWrappedNodes(node).some(
        (node) => node != null && isTargetNode(node)
      );

      if (isWrappingTargetNode) {
        return simpleSelectionExtractor(node);
      }
    }

    return isTargetNode(node) ? simpleSelectionExtractor(node) : null;
  };
}

/**
 * Create a new matcher that will try the given matchers in sequence until one
 * returns non-null
 * @param matchers A list of matchers to try in sequence until one doesn't
 * return null
 * @returns A NodeMatcher that tries the given matchers in sequence
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
