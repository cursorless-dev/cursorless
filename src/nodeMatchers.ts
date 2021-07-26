import { SyntaxNode } from "web-tree-sitter";
import { TextEditor } from "vscode";
import { NodeMatcher, NodeFinder, SelectionExtractor } from "./Types";
import { simpleSelectionExtractor } from "./nodeSelectors";
import { typedNodeFinder } from "./nodeFinders";

export function matcher(
  finder: NodeFinder,
  selector: SelectionExtractor = simpleSelectionExtractor
): NodeMatcher {
  return function (editor: TextEditor, node: SyntaxNode) {
    const targetNode = finder(node);
    return targetNode ? selector(editor, targetNode) : null;
  };
}

export function composedMatcher(
  finders: NodeFinder[],
  selector: SelectionExtractor = simpleSelectionExtractor
): NodeMatcher {
  return function (editor: TextEditor, initialNode: SyntaxNode) {
    let returnNode: SyntaxNode = initialNode;
    for (const finder of finders) {
      const foundNode = finder(returnNode);
      if (foundNode == null) {
        return null;
      }
      returnNode = foundNode;
    }

    return selector(editor, returnNode);
  };
}

export function typeMatcher(...typeNames: string[]) {
  return matcher(typedNodeFinder(...typeNames));
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

export const notSupported: NodeMatcher = (
  editor: TextEditor,
  node: SyntaxNode
) => {
  throw new Error("Node type not supported");
};

export const patternMatcher = (...patterns: string[]): NodeMatcher => {
  return (editor: TextEditor, node: SyntaxNode) => {
    for (const pattern of patterns) {
      const match = tryPatternMatch(node, pattern);
      if (match != null) {
        return simpleSelectionExtractor(editor, match);
      }
    }
    return null;
  };
};

function tryPatternMatch(node: SyntaxNode, pattern: string): SyntaxNode | null {
  const parts = pattern.split(".");
  if (parts.length === 1) {
    return node.type === pattern ? node : null;
  }
  // Matched last. Ascending search.
  if (node.type === parts[parts.length - 1]) {
    let resNode = node;
    for (let i = parts.length - 2; i > -1; --i) {
      if (resNode.parent == null || resNode.parent.type !== parts[i]) {
        return null;
      }
      resNode = resNode.parent;
    }
    return resNode;
  }
  // Matched first. Descending search.
  if (node.type === parts[0]) {
    let resNode = node;
    for (let i = 1; i < parts.length; ++i) {
      const children = resNode.namedChildren.filter(
        (node) => node.type === parts[i]
      );
      if (children.length !== 1) {
        return null;
      }
      resNode = children[0];
    }
    return node;
  }
  return null;
}
