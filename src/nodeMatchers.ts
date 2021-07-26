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
  const rawTypes = pattern.split(".");
  let resultNode;
  if (rawTypes.length === 1) {
    resultNode = node.type === getType(pattern) ? node : null;
  }
  // Matched last. Ascending search.
  else if (node.type === getType(rawTypes[rawTypes.length - 1])) {
    resultNode = searchNodeAscending(node, rawTypes);
  }
  // Matched first. Descending search.
  else if (node.type === getType(rawTypes[0])) {
    resultNode = searchNodeDescending(node, rawTypes);
  }
  if (resultNode != null) {
    const field = getField(rawTypes[0]);
    if (field != null) {
      resultNode = resultNode.childForFieldName(field);
    }
  }
  return resultNode ?? null;
}

function searchNodeAscending(node: SyntaxNode, rawTypes: string[]) {
  let resNode = node;
  for (let i = rawTypes.length - 2; i > -1; --i) {
    const type = getType(rawTypes[i]);
    if (resNode.parent == null || resNode.parent.type !== type) {
      return null;
    }
    resNode = resNode.parent;
  }
  return resNode;
}

function searchNodeDescending(node: SyntaxNode, rawTypes: string[]) {
  let tmpNode = node;
  for (let i = 1; i < rawTypes.length; ++i) {
    const type = getType(rawTypes[i]);
    const children = tmpNode.namedChildren.filter((node) => node.type === type);
    if (children.length !== 1) {
      return null;
    }
    tmpNode = children[0];
  }
  // Even if descending search we always return the "top" node.
  return node;
}

function getType(pattern: string) {
  const index = pattern.indexOf("[");
  if (index > -1) {
    return pattern.slice(0, index);
  }
  return pattern;
}

function getField(pattern: string) {
  const index = pattern.indexOf("[");
  if (index > -1) {
    return pattern.slice(index + 1, pattern.length - 1);
  }
  return null;
}
