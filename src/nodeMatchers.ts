import { SyntaxNode } from "tree-sitter";
import { Position, Selection } from "vscode";

type NodeMatcher = (node: SyntaxNode, isInside: boolean) => Selection | null;

function hasType(...typeNames: string[]): NodeMatcher {
  return (node: SyntaxNode, isInside: boolean) =>
    typeNames.includes(node.type) ? simpleSelectionExtractor(node) : null;
}

function simpleSelectionExtractor(node: SyntaxNode) {
  return new Selection(
    new Position(node.startPosition.row, node.startPosition.column),
    new Position(node.endPosition.row, node.endPosition.column)
  );
}

const nodeMatchers = {
  class: hasType("class_declaration"),
  arrowFunction: hasType("arrow_function"),
  pair: (node: SyntaxNode, isInside: boolean) => {
    if (node.type !== "pair") {
      return null;
    }
    return new Selection(
      new Position(node.startPosition.row, node.startPosition.column),
      new Position(node.endPosition.row, node.endPosition.column)
    );
  },
  namedFunction(node: SyntaxNode, isInside: boolean) {
    // Simple case, eg
    // function foo() {}
    if (
      node.type === "function_declaration" ||
      node.type === "method_definition"
    ) {
      return simpleSelectionExtractor(node);
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
      return simpleSelectionExtractor(node);
    }

    // eg:
    // const foo = () => "hello"
    if (node.type === "lexical_declaration") {
      if (node.namedChildCount !== 1) {
        return null;
      }

      const child = node.firstNamedChild!;

      if (
        child.type === "variable_declarator" &&
        // @ts-ignore
        child.valueNode.type === "arrow_function"
      ) {
        return simpleSelectionExtractor(node);
      }
    }

    return null;
  },
  ifStatement: hasType("if_statement"),
};

export default nodeMatchers;
