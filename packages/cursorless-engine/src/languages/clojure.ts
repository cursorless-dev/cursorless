import type { SimpleScopeTypeType } from "@cursorless/common";
import type { Node } from "web-tree-sitter";
import type { NodeFinder, NodeMatcherAlternative } from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import { createPatternMatchers, matcher } from "../util/nodeMatchers";
import { getChildNodesForFieldName } from "../util/treeSitterUtils";

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

    console.log(node.text, nodeIndex, desiredIndex);

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

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  argumentOrParameter: matcher(
    indexNodeFinder(patternFinder(functionCallPattern), (nodeIndex: number) =>
      nodeIndex !== 0 ? nodeIndex : -1,
    ),
  ),
};

export default createPatternMatchers(nodeMatchers);
