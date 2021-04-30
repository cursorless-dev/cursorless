import { SyntaxNode } from "tree-sitter";
import { Position, Range, Selection, TextEditor } from "vscode";
import { SelectionContext } from "./Types";

interface SelectionWithContext {
  selection: Selection;
  context: SelectionContext;
}

type NodeMatcher = (
  editor: TextEditor,
  node: SyntaxNode,
  isInside: boolean
) => SelectionWithContext | null;

function hasType(...typeNames: string[]): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode, isInside: boolean) =>
    typeNames.includes(node.type) ? simpleSelectionExtractor(node) : null;
}

function simpleSelectionExtractor(node: SyntaxNode): SelectionWithContext {
  return {
    selection: new Selection(
      new Position(node.startPosition.row, node.startPosition.column),
      new Position(node.endPosition.row, node.endPosition.column)
    ),
    context: {},
  };
}

const nodeMatchers = {
  class: hasType("class_declaration"),
  arrowFunction: hasType("arrow_function"),
  pair: (editor: TextEditor, node: SyntaxNode, isInside: boolean) => {
    if (node.type !== "pair") {
      return null;
    }

    var selection: Selection;
    var isMissingTrailingDelimiter: boolean;
    var containingListDelimiter: string;
    const nextNamedSibling = node.nextNamedSibling;
    const previousNamedSibling = node.previousNamedSibling;

    if (nextNamedSibling?.type === "pair") {
      const nextNamedSiblingStartPosition = new Position(
        nextNamedSibling.startPosition.row,
        nextNamedSibling.startPosition.column
      );

      selection = isInside
        ? simpleSelectionExtractor(node).selection
        : new Selection(
            new Position(node.startPosition.row, node.startPosition.column),
            nextNamedSiblingStartPosition
          );

      isMissingTrailingDelimiter = false;
      containingListDelimiter = editor.document.getText(
        new Range(
          new Position(node.endPosition.row, node.endPosition.column),
          nextNamedSiblingStartPosition
        )
      );
    } else {
      selection = simpleSelectionExtractor(node).selection;
      isMissingTrailingDelimiter = true;

      if (previousNamedSibling?.type === "pair") {
        containingListDelimiter = editor.document.getText(
          new Range(
            new Position(
              previousNamedSibling.endPosition.row,
              previousNamedSibling.endPosition.column
            ),
            new Position(node.startPosition.row, node.startPosition.column)
          )
        );
      } else {
        containingListDelimiter = ", ";
      }
    }

    return {
      selection,
      context: { containingListDelimiter, isMissingTrailingDelimiter },
    };
  },
  namedFunction(editor: TextEditor, node: SyntaxNode, isInside: boolean) {
    // Simple case, eg
    // function foo() {}
    if (
      node.type === "function_declaration" ||
      node.type === ".method_definition"
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
