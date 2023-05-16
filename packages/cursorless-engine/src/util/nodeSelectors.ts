import { Position, Range, Selection, TextEditor } from "@cursorless/common";
import { identity, maxBy } from "lodash";
import type { Point, SyntaxNode } from "web-tree-sitter";
import {
  NodeFinder,
  SelectionExtractor,
  SelectionWithContext,
} from "../typings/Types";

export function makeRangeFromPositions(
  startPosition: Point,
  endPosition: Point,
) {
  return new Range(
    startPosition.row,
    startPosition.column,
    endPosition.row,
    endPosition.column,
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
    node.endPosition.column,
  );
}

export function makeNodePairSelection(anchor: SyntaxNode, active: SyntaxNode) {
  return new Selection(
    anchor.startPosition.row,
    anchor.startPosition.column,
    active.endPosition.row,
    active.endPosition.column,
  );
}

/**
 * Returns node range excluding the first and last child
 * @param node The note for which to get the internal range
 * @returns The internal range of the given node
 */
export function getNodeInternalRange(node: SyntaxNode) {
  const children = node.children;

  return makeRangeFromPositions(
    children[0].endPosition,
    children[children.length - 1].startPosition,
  );
}

export function simpleSelectionExtractor(
  editor: TextEditor,
  node: SyntaxNode,
): SelectionWithContext {
  return {
    selection: new Selection(
      new Position(node.startPosition.row, node.startPosition.column),
      new Position(node.endPosition.row, node.endPosition.column),
    ),
    context: {},
  };
}

/**
 * Given a node and a node finder extends the selection from the given node
 * until just before the next matching sibling node or the final node if no
 * sibling matches
 * @param editor The text editor containing the given node
 * @param node The node from which to extend
 * @param nodeFinder The finder to use to determine whether a given node matches
 * @returns A range from the start node until just before the next matching
 * sibling or the final sibling if non matches
 */
export function extendUntilNextMatchingSiblingOrLast(
  editor: TextEditor,
  node: SyntaxNode,
  nodeFinder: NodeFinder,
) {
  const endNode = getNextMatchingSiblingNodeOrLast(node, nodeFinder);
  return pairSelectionExtractor(editor, node, endNode);
}

function getNextMatchingSiblingNodeOrLast(
  node: SyntaxNode,
  nodeFinder: NodeFinder,
): SyntaxNode {
  let currentNode: SyntaxNode = node;
  let nextNode: SyntaxNode | null = node.nextSibling;

  while (nextNode != null && nodeFinder(nextNode) == null) {
    currentNode = nextNode;
    nextNode = nextNode.nextSibling;
  }
  return currentNode;
}

/**
 * Creates an extractor that will extend past the next node if it has one of the
 * types defined in {@link delimiters}
 * @param delimiters Allowable next node type
 * @returns An extractor
 */
export function extendForwardPastOptional(...delimiters: string[]) {
  return function (editor: TextEditor, node: SyntaxNode): SelectionWithContext {
    const nextNode: SyntaxNode | null = node.nextSibling;

    if (nextNode != null && delimiters.includes(nextNode.type)) {
      return pairSelectionExtractor(editor, node, nextNode);
    }

    return simpleSelectionExtractor(editor, node);
  };
}

/**
 * Extracts a selection from the first node to the second node.
 * Both nodes are included in the selected nodes
 */
export function pairSelectionExtractor(
  editor: TextEditor,
  node1: SyntaxNode,
  node2: SyntaxNode,
): SelectionWithContext {
  const isForward = node1.startIndex < node2.startIndex;
  const start = isForward ? node1 : node2;
  const end = isForward ? node2 : node1;
  return {
    selection: new Selection(
      new Position(start.startPosition.row, start.startPosition.column),
      new Position(end.endPosition.row, end.endPosition.column),
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
      node.type === ">" ||
      node.type === "<" ||
      node.type === "}" ||
      node.type === "{",
    ", ",
  );
}

export function unwrapSelectionExtractor(
  editor: TextEditor,
  node: SyntaxNode,
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
      editor.document.positionAt(endIndex),
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
            node.startPosition,
          );
        }
        // First delimiter sibling exists. Terminate after it.
        else {
          leadingDelimiterRange = makeRangeFromPositions(
            firstSibling.startPosition,
            node.startPosition,
          );
        }
      }
      // First sibling exists but is not the delimiter we are looking for. Terminate before it.
      else {
        leadingDelimiterRange = makeRangeFromPositions(
          firstSibling.endPosition,
          node.startPosition,
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

interface ChildRangeSelectorOptions {
  /**
   * If `true`, include unnamed children.  Otherwise, only named children will
   * be used to construct the child range.  Defaults to `false`
   */
  includeUnnamedChildren?: boolean;
}

/**
 * Creates an extractor that returns a contiguous range between children of a node.
 * When no arguments are passed, the function will return a range from the first to the last child node. Pass in either inclusions
 * If an inclusion or exclusion list is passed, we return the first range of children such that every child in the range matches the inclusion / exclusion criteria.
 * @param typesToExclude Ensure these child types are excluded in the contiguous range returned.
 * @param typesToInclude Ensure these child types are included in the contiguous range returned.
 * @returns A selection extractor
 */
export function childRangeSelector(
  typesToExclude: string[] = [],
  typesToInclude: string[] = [],
  { includeUnnamedChildren = false }: ChildRangeSelectorOptions = {},
) {
  return function (editor: TextEditor, node: SyntaxNode): SelectionWithContext {
    if (typesToExclude.length > 0 && typesToInclude.length > 0) {
      throw new Error("Cannot have both exclusions and inclusions.");
    }
    let nodes = includeUnnamedChildren ? node.children : node.namedChildren;
    const exclusionSet = new Set(typesToExclude);
    const inclusionSet = new Set(typesToInclude);
    nodes = nodes.filter((child) => {
      if (exclusionSet.size > 0) {
        return !exclusionSet.has(child.type);
      }

      if (inclusionSet.size > 0) {
        return inclusionSet.has(child.type);
      }

      return true;
    });

    return pairSelectionExtractor(editor, nodes[0], nodes[nodes.length - 1]);
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
            secondSibling.startPosition,
          );
        } else {
          trailingDelimiterRange = makeRangeFromPositions(
            node.endPosition,
            firstSibling.endPosition,
          );
        }
      } else {
        trailingDelimiterRange = makeRangeFromPositions(
          node.endPosition,
          firstSibling.startPosition,
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
  isDelimiterNode: (node: SyntaxNode) => boolean,
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
  isDelimiterNode: (node: SyntaxNode) => boolean,
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

/**
 * Creates a selector which can be used to automatically clean up after elements
 * in a list by removing leading or trailing delimiters
 * @param isDelimiterNode A function used to determine whether a given node is a
 * delimiter node
 * @param defaultDelimiter The default list separator to use if we can't
 * determine it by looking before or after the given node
 * @param getStartNode A function to be applied to the node to determine which
 * node is the start node if we really want to expand to a sequence of nodes
 * @param getEndNode A function to be applied to the node to determine which
 * node is the end node if we really want to expand to a sequence of nodes
 * @returns A selection extractor
 */
export function delimitedSelector(
  isDelimiterNode: (node: SyntaxNode) => boolean,
  defaultDelimiter: string,
  getStartNode: (node: SyntaxNode) => SyntaxNode = identity,
  getEndNode: (node: SyntaxNode) => SyntaxNode = identity,
): SelectionExtractor {
  return (editor: TextEditor, node: SyntaxNode) => {
    let leadingDelimiterRange: Range | undefined;
    let trailingDelimiterRange: Range | undefined;
    const startNode = getStartNode(node);
    const endNode = getEndNode(node);

    const previousNonDelimiterNode = getPreviousNonDelimiterNode(
      startNode,
      isDelimiterNode,
    );
    const nextNonDelimiterNode = getNextNonDelimiterNode(
      endNode,
      isDelimiterNode,
    );

    if (previousNonDelimiterNode != null) {
      leadingDelimiterRange = makeRangeFromPositions(
        previousNonDelimiterNode.endPosition,
        startNode.startPosition,
      );
    }

    if (nextNonDelimiterNode != null) {
      trailingDelimiterRange = makeRangeFromPositions(
        endNode.endPosition,
        nextNonDelimiterNode.startPosition,
      );
    }

    const containingListDelimiter = getInsertionDelimiter(
      editor,
      leadingDelimiterRange,
      trailingDelimiterRange,
      defaultDelimiter,
    );

    return {
      selection: new Selection(
        new Position(
          startNode.startPosition.row,
          startNode.startPosition.column,
        ),
        new Position(endNode.endPosition.row, endNode.endPosition.column),
      ),
      context: {
        containingListDelimiter,
        leadingDelimiterRange,
        trailingDelimiterRange,
      },
    };
  };
}

export function xmlElementExtractor(
  editor: TextEditor,
  node: SyntaxNode,
): SelectionWithContext {
  const selection = simpleSelectionExtractor(editor, node);

  // Interior range for an element is found by excluding the start and end nodes.
  // Element nodes with too few children are self closing and therefore have no interior.
  if (node.namedChildCount > 1) {
    const { firstNamedChild, lastNamedChild } = node;
    if (firstNamedChild != null && lastNamedChild != null) {
      selection.context.interiorRange = new Range(
        firstNamedChild.endPosition.row,
        firstNamedChild.endPosition.column,
        lastNamedChild.startPosition.row,
        lastNamedChild.startPosition.column,
      );
    }
  }

  return selection;
}

export function jsxFragmentExtractor(
  editor: TextEditor,
  node: SyntaxNode,
): SelectionWithContext {
  const selection = simpleSelectionExtractor(editor, node);

  // Interior range for an element is found by excluding the start and end nodes.
  if (node.namedChildCount > 0) {
    const { firstNamedChild, lastNamedChild } = node;
    if (firstNamedChild != null && lastNamedChild != null) {
      selection.context.interiorRange = new Range(
        firstNamedChild.endPosition.row,
        firstNamedChild.endPosition.column,
        lastNamedChild.startPosition.row,
        lastNamedChild.startPosition.column,
      );
    }
  }

  return selection;
}

export function getInsertionDelimiter(
  editor: TextEditor,
  leadingDelimiterRange: Range | undefined,
  trailingDelimiterRange: Range | undefined,
  defaultDelimiterInsertion: string,
) {
  const { document } = editor;
  const delimiters = [
    trailingDelimiterRange != null
      ? document.getText(trailingDelimiterRange)
      : defaultDelimiterInsertion,
    leadingDelimiterRange != null
      ? document.getText(leadingDelimiterRange)
      : defaultDelimiterInsertion,
  ];

  return maxBy(delimiters, "length");
}
