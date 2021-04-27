import { SyntaxNode } from "tree-sitter";
import { Position, Selection } from "vscode";

type NodeMatcher = (node: SyntaxNode) => boolean;

type NodeSelectionExtractor = (
  node: SyntaxNode,
  isInside: boolean
) => Selection | null;

interface NodeDescriptor {
  matcher: NodeMatcher;
  extractor: NodeSelectionExtractor;
}

function hasType(...typeNames: string[]): NodeMatcher {
  return (node: SyntaxNode) => typeNames.includes(node.type);
}

const makeSimpleNodeDescriptor = (...typeNames: string[]) => ({
  matcher: hasType("pair"),
  extractor: simpleSelectionExtractor,
});

function simpleSelectionExtractor(node: SyntaxNode, isInside: boolean) {
  return new Selection(
    new Position(node.startPosition.row, node.startPosition.column),
    new Position(node.endPosition.row, node.endPosition.column)
  );
}

const nodeMatchers = {
  class: makeSimpleNodeDescriptor("class_declaration"),
  arrowFunction: makeSimpleNodeDescriptor("arrow_function"),
  pair: {
    matcher: hasType("pair"),
    extractor: (node: SyntaxNode, isInside: boolean) => {
      return new Selection(
        new Position(node.startPosition.row, node.startPosition.column),
        new Position(node.endPosition.row, node.endPosition.column)
      );
    },
  },
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
  ifStatement: makeSimpleNodeDescriptor("if_statement"),
};

export default nodeMatchers;
