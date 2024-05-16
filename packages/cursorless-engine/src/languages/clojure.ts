import {
  cascadingMatcher,
  chainedMatcher,
  createPatternMatchers,
  matcher,
  patternMatcher,
} from "../util/nodeMatchers";
import { NodeMatcherAlternative, NodeFinder } from "../typings/Types";
import { SimpleScopeTypeType } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { delimitedSelector } from "../util/nodeSelectors";
import { identity } from "lodash";
import { getChildNodesForFieldName } from "../util/treeSitterUtils";
import { patternFinder } from "../util/nodeFinders";

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
  return (node: SyntaxNode) => {
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

function itemFinder() {
  return indexNodeFinder(
    (node) => node,
    (nodeIndex: number) => nodeIndex,
  );
}

/**
 * Return the "value" node children of a given node. These are the items in a list
 * @param node The node whose children to get
 * @returns A list of the value node children of the given node
 */
const getValueNodes = (node: SyntaxNode) =>
  getChildNodesForFieldName(node, "value");

// A function call is a list literal which is not quoted
const functionCallPattern = "~quoting_lit.list_lit!";
const functionCallFinder = patternFinder(functionCallPattern);

/**
 * Matches a function call if the name of the function is one of the given names
 * @param names The acceptable function names
 * @returns The function call node if the name matches otherwise null
 */
function functionNameBasedFinder(...names: string[]) {
  return (node: SyntaxNode) => {
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

const ifStatementFinder = functionNameBasedFinder(
  "if",
  "if-let",
  "when",
  "when-let",
);

const ifStatementMatcher = matcher(ifStatementFinder);

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  map: "map_lit",

  collectionKey: matcher(mapParityNodeFinder(0)),
  collectionItem: cascadingMatcher(
    // Treat each key value pair as a single item if we're in a map
    matcher(
      mapParityNodeFinder(0),
      delimitedSelector(
        (node) => node.type === "{" || node.type === "}",
        ", ",
        identity,
        mapParityNodeFinder(1) as (node: SyntaxNode) => SyntaxNode,
      ),
    ),

    // Otherwise just treat every item within a list as an item
    matcher(itemFinder()),
  ),
  value: matcher(mapParityNodeFinder(1)),

  // FIXME: Handle formal parameters
  argumentOrParameter: matcher(
    indexNodeFinder(patternFinder(functionCallPattern), (nodeIndex: number) =>
      nodeIndex !== 0 ? nodeIndex : -1,
    ),
  ),

  // A list is either a vector literal or a quoted list literal
  list: ["vec_lit", "quoting_lit.list_lit"],

  functionCall: functionCallPattern,
  functionCallee: chainedMatcher([
    functionCallFinder,
    (functionNode) => getValueNodes(functionNode)[0],
  ]),

  namedFunction: matcher(functionFinder),

  functionName: functionNameMatcher,

  // FIXME: Handle `let` declarations, defs, etc
  name: functionNameMatcher,

  anonymousFunction: cascadingMatcher(
    functionNameBasedMatcher("fn"),
    patternMatcher("anon_fn_lit"),
  ),

  ifStatement: ifStatementMatcher,

  condition: chainedMatcher([
    ifStatementFinder,
    (node) => getValueNodes(node)[1],
  ]),
};

export default createPatternMatchers(nodeMatchers);
