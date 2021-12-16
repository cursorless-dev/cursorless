import { Position, Selection } from "vscode";
import { Point, SyntaxNode } from "web-tree-sitter";
import { NodeFinder } from "../typings/Types";

export const nodeFinder = (
  isTargetNode: (node: SyntaxNode) => boolean
): NodeFinder => {
  return (node: SyntaxNode) => {
    return isTargetNode(node) ? node : null;
  };
};

/**
 * Given a list of node finders returns a new node finder which applies them in
 * sequence returning null if any of the sequence returns null otherwise
 * returning the output of the final node finder
 * @param nodeFinders A list of node finders to apply in sequence
 * @returns A node finder which is a chain of the input node finders
 */
export function chainedNodeFinder(...nodeFinders: NodeFinder[]) {
  return (node: SyntaxNode) => {
    let currentNode: SyntaxNode | null = node;
    for (const nodeFinder of nodeFinders) {
      currentNode = nodeFinder(currentNode);
      if (currentNode == null) {
        return null;
      }
    }

    return currentNode;
  };
}

export const typedNodeFinder = (...typeNames: string[]): NodeFinder => {
  return nodeFinder((node) => typeNames.includes(node.type));
};

const toPosition = (point: Point) => new Position(point.row, point.column);

export const argumentNodeFinder = (...parentTypes: string[]): NodeFinder => {
  const left = ["(", "{", "["];
  const right = [")", "}", "]"];
  const delimiters = left.concat(right);
  const isType = (node: SyntaxNode | null, typeNames: string[]) =>
    node != null && typeNames.includes(node.type);
  const isOk = (node: SyntaxNode | null) =>
    node != null && !isType(node, delimiters);
  return (node: SyntaxNode, selection?: Selection) => {
    let resultNode: SyntaxNode | null;
    const { start, end } = selection!;
    // Is already child
    if (isType(node.parent, parentTypes)) {
      if (isType(node, left)) {
        resultNode = node.nextNamedSibling;
      } else if (isType(node, right)) {
        resultNode = node.previousNamedSibling;
      } else if (node.type === ",") {
        resultNode = end.isBeforeOrEqual(toPosition(node.startPosition))
          ? node.previousNamedSibling
          : node.nextNamedSibling;
      } else {
        resultNode = node;
      }
      return isOk(resultNode) ? resultNode : null;
      // Is parent
    } else if (isType(node, parentTypes)) {
      const children = [...node.children];
      const childRight =
        children.find(({ startPosition }) =>
          toPosition(startPosition).isAfterOrEqual(end)
        ) ?? null;
      if (isOk(childRight)) {
        return childRight;
      }
      children.reverse();
      const childLeft =
        children.find(({ endPosition }) =>
          toPosition(endPosition).isBeforeOrEqual(start)
        ) ?? null;
      if (isOk(childLeft)) {
        return childLeft;
      }
    }
    return null;
  };
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
  const parsedPatterns = parsePatternStrings(patterns);
  return (node: SyntaxNode) => {
    for (const pattern of parsedPatterns) {
      const match = tryPatternMatch(node, pattern);
      if (match != null) {
        return match;
      }
    }
    return null;
  };
}

function parsePatternStrings(patternStrings: string[]) {
  return patternStrings.map((patternString) =>
    patternString.split(".").map((pattern) => new Pattern(pattern))
  );
}

function tryPatternMatch(
  node: SyntaxNode,
  patterns: Pattern[]
): SyntaxNode | null {
  const firstPattern = patterns[0];
  const lastPattern = patterns[patterns.length - 1];
  let resultNode: SyntaxNode | null = null;
  let resultPattern;
  // Only one type try to match current node.
  if (patterns.length === 1) {
    if (firstPattern.typeEquals(node)) {
      resultNode = node;
      resultPattern = firstPattern;
    }
  } else {
    // Matched last. Ascending search.
    if (lastPattern.typeEquals(node)) {
      const result = searchNodeAscending(node, lastPattern, patterns);
      if (result != null) {
        [resultNode, resultPattern] = result;
      }
    }
    // Matched first. Descending search.
    if (resultNode == null && firstPattern.typeEquals(node)) {
      const result = searchNodeDescending(node, firstPattern, patterns);
      if (result != null) {
        [resultNode, resultPattern] = result;
      }
    }
  }
  // Use field name child if field name is given
  if (
    resultNode != null &&
    resultPattern != null &&
    resultPattern.fields != null
  ) {
    resultPattern.fields.forEach((field) => {
      resultNode = resultNode?.childForFieldName(field) ?? null;
    });
  }
  return resultNode;
}

type NodePattern = [SyntaxNode, Pattern] | null;

function searchNodeAscending(
  node: SyntaxNode,
  lastPattern: Pattern,
  patterns: Pattern[]
): NodePattern {
  let resultNode = node;
  let resultPattern = lastPattern;
  let important: NodePattern = lastPattern.isImportant
    ? [node, lastPattern]
    : null;
  for (let i = patterns.length - 2; i > -1; --i) {
    const pattern = patterns[i];
    if (resultNode.parent == null || !pattern.typeEquals(resultNode.parent)) {
      if (pattern.isOptional) {
        continue;
      }
      return null;
    }
    resultNode = resultNode.parent;
    resultPattern = pattern;
    if (pattern.isImportant) {
      important = [resultNode, pattern];
    }
  }
  return important != null ? important : [resultNode, resultPattern];
}

function searchNodeDescending(
  node: SyntaxNode,
  firstPattern: Pattern,
  patterns: Pattern[]
): NodePattern {
  let tmpNode = node;
  // Even if descending search we return the "top" node by default.
  let important: NodePattern = [node, firstPattern];
  for (let i = 1; i < patterns.length; ++i) {
    const pattern = patterns[i];
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
  fields: string[] | null = null;
  isImportant: boolean = false;
  isOptional: boolean = false;

  constructor(pattern: string) {
    this.type = pattern.match(/^[\w*~]+/)![0];
    this.fields = [...pattern.matchAll(/(?<=\[).+?(?=\])/g)].map((m) => m[0]);
    this.isImportant = pattern.indexOf("!") > -1;
    this.isOptional = pattern.indexOf("?") > -1;
  }

  typeEquals(node: SyntaxNode) {
    return (
      this.type === node.type ||
      this.type === "*" ||
      (this.type.startsWith("~") && this.type.slice(1) !== node.type)
    );
  }
}
