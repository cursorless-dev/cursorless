import { SyntaxNode } from "tree-sitter";

type NodeMatcher = (node: SyntaxNode) => boolean;

function makeSimpleTypeMatcher(...typeNames: string[]): NodeMatcher {
  return (node: SyntaxNode) => typeNames.includes(node.type);
}

const nodeMatchers = {
  class: makeSimpleTypeMatcher("class_declaration"),
  arrowFunction: makeSimpleTypeMatcher("arrow_function"),
  namedFunction(node: SyntaxNode) {
    // Simple case, eg
    // function foo() {}
    if (
      node.type === "function_declaration" ||
      node.type === "method_definition"
    ) {
      return true;
    }

    // Class property defined as field definition with arrow
    // eg:
    // class Foo {
    //   bar = () => "hello";
    // }
    if (
      node.type === "public_field_definition" &&
      // @ts-ignore
      node.valueNode.type === "arrow_function"
    ) {
      return true;
    }

    // eg:
    // const foo = () => "hello"
    if (node.type === "lexical_declaration") {
      if (node.namedChildCount !== 1) {
        return false;
      }

      const child = node.firstNamedChild!;

      if (
        child.type === "variable_declarator" &&
        // @ts-ignore
        child.valueNode.type === "arrow_function"
      ) {
        return true;
      }
    }

    return false;
  },
  ifStatement: makeSimpleTypeMatcher("if_statement"),
};

export default nodeMatchers;
