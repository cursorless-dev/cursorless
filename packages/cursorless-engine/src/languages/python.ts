import { Selection, SimpleScopeTypeType } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { NodeFinder, NodeMatcherAlternative } from "../typings/Types";
import { argumentNodeFinder } from "../util/nodeFinders";
import {
  cascadingMatcher,
  createPatternMatchers,
  matcher,
} from "../util/nodeMatchers";
import { argumentSelectionExtractor } from "../util/nodeSelectors";

export const getTypeNode = (node: SyntaxNode) =>
  node.children.find((child) => child.type === "type") ?? null;

function itemNodeFinder(
  parentType: string,
  childType: string,
  excludeFirstChild: boolean = false,
): NodeFinder {
  const finder = argumentNodeFinder(parentType);
  return (node: SyntaxNode, selection?: Selection) => {
    const childNode = finder(node, selection);
    if (
      childNode?.type === childType &&
      (!excludeFirstChild ||
        childNode.id !== childNode.parent?.firstNamedChild?.id)
    ) {
      return childNode;
    }
    return null;
  };
}

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  collectionItem: cascadingMatcher(
    matcher(
      itemNodeFinder("import_from_statement", "dotted_name", true),
      argumentSelectionExtractor(),
    ),
    matcher(
      itemNodeFinder("import_statement", "dotted_name", false),
      argumentSelectionExtractor(),
    ),
    matcher(
      itemNodeFinder("global_statement", "identifier"),
      argumentSelectionExtractor(),
    ),
  ),
};

export default createPatternMatchers(nodeMatchers);
