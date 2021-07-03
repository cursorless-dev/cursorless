import { SyntaxNode } from "web-tree-sitter";
import { TextEditor } from "vscode";
import { NodeMatcher, NodeFinder, SelectionExtractor } from "./Types";
import { simpleSelectionExtractor } from "./nodeSelectors";
import { findNodeOfType } from "./nodeFinders";

export function matcher(
  finder: NodeFinder,
  selector: SelectionExtractor = simpleSelectionExtractor
): NodeMatcher {
  return function (editor: TextEditor, node: SyntaxNode) {
    const targetNode = finder(node);
    return targetNode ? selector(editor, targetNode) : null;
  };
}

export function composedMatcher(
  finders: NodeFinder[],
  selector: SelectionExtractor = simpleSelectionExtractor
): NodeMatcher {
  return function (editor: TextEditor, initialNode: SyntaxNode) {
    let returnNode: SyntaxNode | null = initialNode;
    for (const finder of finders) {
      returnNode = returnNode ? finder(returnNode) : null;
    }

    return returnNode ? selector(editor, returnNode) : null;
  };
}

export function typeMatcher(...typeNames: string[]) {
  return matcher(findNodeOfType(...typeNames));
}

/**
 * Create a new matcher that will try the given matchers in sequence until one
 * returns non-null
 * @param matchers A list of matchers to try in sequence until one doesn't
 * return null
 * @returns A NodeMatcher that tries the given matchers in sequence
 */
export function cascadingMatcher(...matchers: NodeMatcher[]): NodeMatcher {
  return (editor: TextEditor, node: SyntaxNode) => {
    for (const matcher of matchers) {
      const match = matcher(editor, node);
      if (match != null) {
        return match;
      }
    }

    return null;
  };
}

export const notSupported: NodeMatcher = (
  editor: TextEditor,
  node: SyntaxNode
) => {
  throw new Error("Node type not supported");
};
