import { SyntaxNode } from "tree-sitter";
import { Position, Range, Selection, TextEditor } from "vscode";
import { SelectionContext } from "./Types";

interface SelectionWithContext {
  selection: Selection;
  context: SelectionContext;
}

type NodeMatcher = (
  editor: TextEditor,
  node: SyntaxNode
) => SelectionWithContext | null;

function hasType(...typeNames: string[]): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode) =>
    typeNames.includes(node.type) ? simpleSelectionExtractor(node) : null;
}

function getNextNonDelimiterNode(
  startNode: SyntaxNode,
  isDelimiterNode: (node: SyntaxNode) => boolean
): SyntaxNode | null {
  var node = startNode.nextSibling;

  while (node != null) {
    if (!isDelimiterNode(node)) {
      return node;
    }

    node = node.nextSibling;
  }

  return node;
}

function getPreviousNonDelimiterNode(
  startNode: SyntaxNode,
  isDelimiterNode: (node: SyntaxNode) => boolean
): SyntaxNode | null {
  var node = startNode.previousSibling;

  while (node != null) {
    if (!isDelimiterNode(node)) {
      return node;
    }

    node = node.previousSibling;
  }

  return node;
}

function delimitedMatcher(
  nodeMatches: (node: SyntaxNode) => boolean,
  isDelimiterNode: (node: SyntaxNode) => boolean,
  defaultDelimiter: string
): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode) => {
    if (!nodeMatches(node)) {
      return null;
    }

    var containingListDelimiter: string | null = null;
    var leadingDelimiterRange: Range | null = null;
    var trailingDelimiterRange: Range | null = null;

    const nextNonDelimiterNode = getNextNonDelimiterNode(node, isDelimiterNode);
    const previousNonDelimiterNode = getPreviousNonDelimiterNode(
      node,
      isDelimiterNode
    );

    if (nextNonDelimiterNode != null) {
      trailingDelimiterRange = new Range(
        new Position(node.endPosition.row, node.endPosition.column),
        new Position(
          nextNonDelimiterNode.startPosition.row,
          nextNonDelimiterNode.startPosition.column
        )
      );

      containingListDelimiter = editor.document.getText(trailingDelimiterRange);
    }

    if (previousNonDelimiterNode != null) {
      leadingDelimiterRange = new Range(
        new Position(
          previousNonDelimiterNode.endPosition.row,
          previousNonDelimiterNode.endPosition.column
        ),
        new Position(node.startPosition.row, node.startPosition.column)
      );

      if (containingListDelimiter == null) {
        containingListDelimiter = editor.document.getText(
          leadingDelimiterRange
        );
      }
    }

    if (containingListDelimiter == null) {
      containingListDelimiter = defaultDelimiter;
    }

    return {
      ...simpleSelectionExtractor(node),
      context: {
        isInDelimitedList: true,
        containingListDelimiter,
        leadingDelimiterRange,
        trailingDelimiterRange,
      },
    };
  };
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
  pair: delimitedMatcher(
    (node) => node.type === "pair",
    (node) => node.type === "," || node.type === "}" || node.type === "{",
    ", "
  ),
  namedFunction(editor: TextEditor, node: SyntaxNode) {
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
