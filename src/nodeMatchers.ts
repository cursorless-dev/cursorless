import { SyntaxNode } from "tree-sitter";

type NodeMatcher = (node: SyntaxNode) => boolean;

function makeSimpleTypeMatcher(...typeNames: string[]): NodeMatcher {
  return (node: SyntaxNode) => typeNames.includes(node.type);
}

const nodeMatchers = {
  class: makeSimpleTypeMatcher("class_declaration"),
  arrowFunction: makeSimpleTypeMatcher("arrow_function"),
  // TODO Handle situation where we are declaring a function using an arrow
  // function
  namedFunction: makeSimpleTypeMatcher(
    "function_declaration",
    "method_definition"
  ),
  ifStatement: makeSimpleTypeMatcher("if_statement"),
};

export default nodeMatchers;
