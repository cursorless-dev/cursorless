import { SyntaxNode } from "web-tree-sitter";
import { TextEditor } from "vscode";
import {
  NodeMatcher,
  NodeFinder,
  SelectionExtractor,
  NodeMatcherAlternative,
  ScopeType,
} from "./Types";
import { simpleSelectionExtractor } from "./nodeSelectors";
import { typedNodeFinder, patternFinder } from "./nodeFinders";

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
    let returnNode: SyntaxNode = initialNode;
    for (const finder of finders) {
      const foundNode = finder(returnNode);
      if (foundNode == null) {
        return null;
      }
      returnNode = foundNode;
    }

    return selector(editor, returnNode);
  };
}

export function typeMatcher(...typeNames: string[]) {
  return matcher(typedNodeFinder(...typeNames));
}

export function patternMatcher(...patterns: string[]): NodeMatcher {
  return matcher(patternFinder(...patterns));
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

export function createPatternMatchers(
  nodeMatchers: Record<ScopeType, NodeMatcherAlternative>
): Record<ScopeType, NodeMatcher> {
  Object.keys(nodeMatchers).forEach((scopeType: ScopeType) => {
    let matcher = nodeMatchers[scopeType];
    if (Array.isArray(matcher)) {
      nodeMatchers[scopeType] = patternMatcher(...matcher);
    } else if (typeof matcher === "string") {
      nodeMatchers[scopeType] = patternMatcher(matcher);
    }
  });
  return nodeMatchers as Record<ScopeType, NodeMatcher>;
}
