import { Selection, SimpleScopeTypeType } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { NodeFinder, NodeMatcherAlternative } from "../typings/Types";
import { argumentNodeFinder, patternFinder } from "../util/nodeFinders";
import {
  argumentMatcher,
  cascadingMatcher,
  createPatternMatchers,
  matcher,
} from "../util/nodeMatchers";
import { childRangeSelector } from "../util/nodeSelectors";

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
  argumentOrParameter: cascadingMatcher(
    argumentMatcher("parameters", "argument_list"),
    matcher(patternFinder("call.generator_expression!"), childRangeSelector()),
  ),
};

export default createPatternMatchers(nodeMatchers);
