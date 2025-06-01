import type { SimpleScopeTypeType } from "@cursorless/common";
import type { Node } from "web-tree-sitter";
import type { NodeFinder, NodeMatcherAlternative } from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  cascadingMatcher,
  chainedMatcher,
  createPatternMatchers,
  matcher,
  patternMatcher,
} from "../util/nodeMatchers";
import { getChildNodesForFieldName } from "../util/treeSitterUtils";

/**
 * Picks a node by rounding down and using the given parity. This function is
 * useful for picking the picking eg the key in a sequence of key-value pairs
 * @param parentFinder The finder to use to determine whether the parent is a
 * match
 * @param parity The parity that we're looking for
 * @returns A node finder
 */
function parityNodeFinder(parentFinder: NodeFinder, parity: 0 | 1) {
  return indexNodeFinder(
    parentFinder,
    (nodeIndex: number) => Math.floor(nodeIndex / 2) * 2 + parity,
  );
}

function mapParityNodeFinder(parity: 0 | 1) {
  return parityNodeFinder(patternFinder("map_lit"), parity);
}

/**
 * Creates a node finder which will apply a transformation to the index of a
 * value node and return the node at the given index of the nodes parent
 * @param parentFinder A finder which will be applied to the parent to determine
 * whether it is a match
 * @param indexTransform A function that will be applied to the index of the
 * value node. The node at the given index will be used instead of the node
 * itself
 * @returns A node finder based on the given description
 */
function indexNodeFinder(
  parentFinder: NodeFinder,
  indexTransform: (index: number) => number,
) {
  return (node: Node) => {
    const parent = node.parent;

    if (parent == null || parentFinder(parent) == null) {
      return null;
    }

    const valueNodes = getValueNodes(parent);

    const nodeIndex = valueNodes.findIndex(({ id }) => id === node.id);

    if (nodeIndex === -1) {
      // FIXME: In the future we might conceivably try to handle saying "take
      // item" when the selection is inside a comment between the key and value
      return null;
    }

    const desiredIndex = indexTransform(nodeIndex);

    if (desiredIndex === -1) {
      return null;
    }

    return valueNodes[desiredIndex];
  };
}

/**
 * Return the "value" node children of a given node. These are the items in a list
 * @param node The node whose children to get
 * @returns A list of the value node children of the given node
 */
const getValueNodes = (node: Node) => getChildNodesForFieldName(node, "value");

// A function call is a list literal which is not quoted
const functionCallPattern = "~quoting_lit.list_lit!";
const functionCallFinder = patternFinder(functionCallPattern);

/**
 * Matches a function call if the name of the function is one of the given names
 * @param names The acceptable function names
 * @returns The function call node if the name matches otherwise null
 */
function functionNameBasedFinder(...names: string[]) {
  return (node: Node) => {
    const functionCallNode = functionCallFinder(node);
    if (functionCallNode == null) {
      return null;
    }

    const functionNode = getValueNodes(functionCallNode)[0];

    return names.includes(functionNode?.text) ? functionCallNode : null;
  };
}

function functionNameBasedMatcher(...names: string[]) {
  return matcher(functionNameBasedFinder(...names));
}

const functionFinder = functionNameBasedFinder("defn", "defmacro");

const functionNameMatcher = chainedMatcher([
  functionFinder,
  (functionNode) => getValueNodes(functionNode)[1],
]);

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  collectionKey: matcher(mapParityNodeFinder(0)),
  value: matcher(mapParityNodeFinder(1)),

  // FIXME: Handle formal parameters
  argumentOrParameter: matcher(
    indexNodeFinder(patternFinder(functionCallPattern), (nodeIndex: number) =>
      nodeIndex !== 0 ? nodeIndex : -1,
    ),
  ),

  functionCall: functionCallPattern,
  functionCallee: chainedMatcher([
    functionCallFinder,
    (functionNode) => getValueNodes(functionNode)[0],
  ]),

  anonymousFunction: cascadingMatcher(
    functionNameBasedMatcher("fn"),
    patternMatcher("anon_fn_lit"),
  ),
};

export default createPatternMatchers(nodeMatchers);
