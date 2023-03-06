import { Position, Selection } from "@cursorless/common";
import { Point, SyntaxNode } from "web-tree-sitter";
import { NodeFinder } from "../typings/Types";

export const nodeFinder = (
  isTargetNode: (node: SyntaxNode) => boolean,
): NodeFinder => {
  return (node: SyntaxNode) => {
    return isTargetNode(node) ? node : null;
  };
};

/**
 * Returns a new node finder which applies `nodeFinder` to the given node and
 * then to each of its previous siblings in turn, returning the first one that
 * is non null.
 * @param nodeFinder The node finder to use
 * @returns A node finder
 */
export function leadingSiblingNodeFinder(nodeFinder: NodeFinder) {
  return (node: SyntaxNode) => {
    let currentNode: SyntaxNode | null = node;

    while (currentNode != null) {
      const returnNode = nodeFinder(currentNode);

      if (returnNode != null) {
        return returnNode;
      }

      currentNode = currentNode.previousSibling;
    }

    return null;
  };
}

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

/**
 * Given a sequence of node finders, returns a new node finder which applies
 * them in reverse, walking up the ancestor chain from `node`.
 * Returns `null` if any finder in the chain returns null.  For example:
 *
 * ancestorChainNodeFinder(0, patternFinder("foo", "bar"), patternFinder("bongo"))
 *
 * is equivalent to:
 *
 * patternFinder("foo.bongo", "bar.bongo")
 *
 * @param nodeToReturn The index of the node from the sequence to return.  For
 * example, `0` returns the top ancestor in the chain
 * @param nodeFinders A list of node finders to apply in sequence
 * @returns A node finder which is a chain of the input node finders
 */
export function ancestorChainNodeFinder(
  nodeToReturn: number,
  ...nodeFinders: NodeFinder[]
) {
  return (node: SyntaxNode) => {
    let currentNode: SyntaxNode | null = node;
    const nodeList: SyntaxNode[] = [];
    const nodeFindersReversed = [...nodeFinders].reverse();

    for (const nodeFinder of nodeFindersReversed) {
      if (currentNode == null) {
        return null;
      }

      currentNode = nodeFinder(currentNode);

      if (currentNode == null) {
        return null;
      }

      nodeList.push(currentNode);

      currentNode = currentNode.parent ?? null;
    }

    return nodeList.reverse()[nodeToReturn];
  };
}

export const typedNodeFinder = (...typeNames: string[]): NodeFinder => {
  return nodeFinder((node) => typeNames.includes(node.type));
};

const toPosition = (point: Point) => new Position(point.row, point.column);

export const argumentNodeFinder = (...parentTypes: string[]): NodeFinder => {
  const left = ["(", "{", "[", "<"];
  const right = [")", "}", "]", ">"];
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
          toPosition(startPosition).isAfterOrEqual(end),
        ) ?? null;
      if (isOk(childRight)) {
        return childRight;
      }
      children.reverse();
      const childLeft =
        children.find(({ endPosition }) =>
          toPosition(endPosition).isBeforeOrEqual(start),
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
  getWrappedNodes: (node: SyntaxNode) => (SyntaxNode | null)[],
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
        (node) => node != null && isTargetNode(node),
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
    patternString.split(".").map((pattern) => new Pattern(pattern)),
  );
}

function tryPatternMatch(
  node: SyntaxNode,
  patterns: Pattern[],
): SyntaxNode | null {
  let result = searchNodeAscending(node, patterns);

  if (!result && patterns.length > 1) {
    result = searchNodeDescending(node, patterns);
  }

  let resultNode: SyntaxNode | null = null;
  let resultPattern;

  if (result != null) {
    [resultNode, resultPattern] = result;
  }

  // Use field name child if field name is given
  if (
    resultNode != null &&
    resultPattern != null &&
    resultPattern.fields != null
  ) {
    resultPattern.fields.forEach((field) => {
      resultNode =
        (field.isIndex
          ? resultNode?.namedChild(field.value)
          : resultNode?.childForFieldName(field.value)) ?? null;
    });
  }

  return resultNode;
}

type NodePattern = [SyntaxNode, Pattern] | null;

function searchNodeAscending(
  node: SyntaxNode,
  patterns: Pattern[],
): NodePattern {
  let result: NodePattern = null;
  let currentNode: SyntaxNode | null = node;

  for (let i = patterns.length - 1; i > -1; --i) {
    const pattern = patterns[i];

    if (currentNode == null || !pattern.typeEquals(currentNode)) {
      if (pattern.isOptional) {
        continue;
      }
      return null;
    }

    // Return top node if not important found
    if (!result || !result[1].isImportant) {
      result = [currentNode, pattern];
    }

    currentNode = currentNode.parent;
  }

  return result;
}

function searchNodeDescending(
  node: SyntaxNode,
  patterns: Pattern[],
): NodePattern {
  let result: NodePattern = null;
  let currentNode: SyntaxNode | null = node;

  for (let i = 0; i < patterns.length; ++i) {
    const pattern = patterns[i];

    if (currentNode == null || !pattern.typeEquals(currentNode)) {
      if (pattern.isOptional) {
        continue;
      }
      return null;
    }

    // Return top node if not important found
    if (!result || pattern.isImportant) {
      result = [currentNode, pattern];
    }

    if (i + 1 < patterns.length) {
      const children: SyntaxNode[] = currentNode.namedChildren.filter((node) =>
        patterns[i + 1].typeEquals(node),
      );
      currentNode = children.length === 1 ? children[0] : null;
    }
  }

  return result;
}

interface PatternFieldIndex {
  isIndex: true;
  value: number;
}

interface PatternFieldName {
  isIndex: false;
  value: string;
}

type PatternField = PatternFieldName | PatternFieldIndex;

class Pattern {
  type: string;
  fields: PatternField[];
  isImportant: boolean;
  isOptional: boolean;
  anyType: boolean = false;
  notType: boolean = false;

  constructor(pattern: string) {
    this.type = pattern.match(/^[\w*~]+/)![0];
    if (this.type === "*") {
      this.anyType = true;
    } else if (this.type.startsWith("~")) {
      this.type = this.type.slice(1);
      this.notType = true;
    }
    this.isImportant = pattern.indexOf("!") > -1;
    this.isOptional = pattern.indexOf("?") > -1;
    this.fields = [...pattern.matchAll(/(?<=\[).+?(?=\])/g)]
      .map((m) => m[0])
      .map((field) => {
        if (/\d+/.test(field)) {
          return {
            isIndex: true,
            value: Number(field),
          };
        }
        return {
          isIndex: false,
          value: field,
        };
      });
  }

  typeEquals(node: SyntaxNode) {
    if (this.anyType) {
      return true;
    }
    if (this.notType) {
      return this.type !== node.type;
    }
    return this.type === node.type;
  }
}
