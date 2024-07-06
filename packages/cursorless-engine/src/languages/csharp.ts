import { SimpleScopeTypeType } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { NodeMatcherAlternative } from "../typings/Types";
import { nodeFinder, typedNodeFinder } from "../util/nodeFinders";
import {
  chainedMatcher,
  createPatternMatchers,
  leadingMatcher,
  matcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import { delimitedSelector } from "../util/nodeSelectors";

const makeDelimitedSelector = (leftType: string, rightType: string) =>
  delimitedSelector(
    (node) =>
      node.type === "," || node.type === leftType || node.type === rightType,
    ", ",
  );

const getMapMatchers = {
  collectionKey: chainedMatcher([
    typedNodeFinder("assignment_expression"),
    (node: SyntaxNode) => node.childForFieldName("left"),
  ]),
  value: leadingMatcher(
    [
      "variable_declaration?.variable_declarator[1][0]!",
      "assignment_expression[right]",
    ],
    ["assignment_operator"],
  ),
};

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  ...getMapMatchers,
  argumentOrParameter: matcher(
    nodeFinder(
      (node) =>
        node.parent?.type === "argument_list" || node.type === "parameter",
    ),
    makeDelimitedSelector("(", ")"),
  ),
  type: trailingMatcher(["*[type]"]),
  name: [
    "variable_declaration?.variable_declarator.identifier!",
    "assignment_expression[left]",
    "*[name]",
  ],
};

export default createPatternMatchers(nodeMatchers);
