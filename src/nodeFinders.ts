import { SyntaxNode } from "web-tree-sitter";
import { NodeFinder } from "./Types";

export const nodeFinder = (
  isTargetNode: (node: SyntaxNode) => boolean
): NodeFinder => {
  return (node: SyntaxNode) => {
    return isTargetNode(node) ? node : null;
  };
};

export const typedNodeFinder = (...typeNames: string[]): NodeFinder => {
  return nodeFinder((node) => typeNames.includes(node.type));
};

/**
 * Creates a matcher that can match potentially wrapped nodes. For example
 * typescript export statements or python decorators
 * @param isWrapperNode Returns node if the given node has the right type to be
 * a wrapper node
 * @param isTargetNode Returns node if the given node has the right type to be
 * the target
 * @param getWrappedNodes Given a wrapper node returns a list of possible
 * target nodes
 * @returns A matcher that will return the given target node or the wrapper
 * node, if it is wrapping a target node
 */
export function findPossiblyWrappedNode(
  isWrapperNode: NodeFinder,
  isTargetNode: NodeFinder,
  getWrappedNodes: (node: SyntaxNode) => (SyntaxNode | null)[]
): NodeFinder {
  return (node: SyntaxNode) => {
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
        return node;
      }
    }

    return isTargetNode(node) ? node : null;
  };
}

export function patternFinder(...patterns: string[]): NodeFinder {
  return (node: SyntaxNode) => {
    for (const pattern of patterns) {
      const match = tryPatternMatch(node, pattern);
      if (match != null) {
        return match;
      }
    }
    return null;
  };
}

function tryPatternMatch(node: SyntaxNode, pattern: string): SyntaxNode | null {
  const rawPatterns = pattern.split(".");
  const firstPattern = new Pattern(rawPatterns[0]);
  const lastPattern = new Pattern(rawPatterns[rawPatterns.length - 1]);
  let resultNode, resultPattern;
  // Only one type try to match current node.
  if (rawPatterns.length === 1) {
    if (firstPattern.typeEquals(node)) {
      resultNode = node;
      resultPattern = firstPattern;
    }
  }
  // Matched last. Ascending search.
  else if (lastPattern.typeEquals(node)) {
    const result = searchNodeAscending(node, lastPattern, rawPatterns);
    if (result != null) {
      [resultNode, resultPattern] = result;
    }
  }
  // Matched first. Descending search.
  else if (firstPattern.typeEquals(node)) {
    const result = searchNodeDescending(node, firstPattern, rawPatterns);
    if (result != null) {
      [resultNode, resultPattern] = result;
    }
  }
  // Use field name child if field name is given
  if (
    resultNode != null &&
    resultPattern != null &&
    resultPattern.field != null
  ) {
    resultNode = resultNode.childForFieldName(resultPattern.field);
  }
  return resultNode ?? null;
}

type NodePattern = [SyntaxNode, Pattern] | null;

function searchNodeAscending(
  node: SyntaxNode,
  lastPattern: Pattern,
  rawPatterns: string[]
): NodePattern {
  let resNode = node;
  let important: NodePattern = lastPattern.isImportant
    ? [node, lastPattern]
    : null;
  for (let i = rawPatterns.length - 2; i > -1; --i) {
    const pattern = new Pattern(rawPatterns[i]);
    if (resNode.parent == null || !pattern.typeEquals(resNode.parent)) {
      if (pattern.isOptional) {
        continue;
      }
      return null;
    }
    resNode = resNode.parent;
    if (pattern.isImportant) {
      important = [resNode, pattern];
    }
  }
  return important != null ? important : [resNode, lastPattern];
}

function searchNodeDescending(
  node: SyntaxNode,
  firstPattern: Pattern,
  rawPatterns: string[]
): NodePattern {
  let tmpNode = node;
  // Even if descending search we return the "top" node by default.
  let important: NodePattern = [node, firstPattern];
  for (let i = 1; i < rawPatterns.length; ++i) {
    const pattern = new Pattern(rawPatterns[i]);
    const children = tmpNode.namedChildren.filter((node) =>
      pattern.typeEquals(node)
    );
    if (children.length !== 1) {
      if (pattern.isOptional) {
        continue;
      }
      return null;
    }
    tmpNode = children[0];
    if (pattern.isImportant) {
      important = [tmpNode, pattern];
    }
  }
  return important;
}

class Pattern {
  type: string;
  field: string | null = null;
  isImportant: boolean = false;
  isOptional: boolean = false;

  constructor(pattern: string) {
    const fieldIndex = pattern.indexOf("[");
    if (fieldIndex > -1) {
      this.field = pattern.slice(
        fieldIndex + 1,
        pattern.indexOf("]", fieldIndex + 1)
      );
    }
    const importantIndex = pattern.indexOf("!");
    const optionalIndex = pattern.indexOf("?");
    this.isImportant = importantIndex > -1;
    this.isOptional = optionalIndex > -1;
    const indexes = [fieldIndex, importantIndex, optionalIndex].filter(
      (index) => index > -1
    );
    this.type =
      indexes.length > 0 ? pattern.slice(0, Math.max(...indexes)) : pattern;
  }

  typeEquals(node: SyntaxNode) {
    return this.type === node.type || this.type === "*";
  }
}
