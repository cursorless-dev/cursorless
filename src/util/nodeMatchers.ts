import { SyntaxNode } from "web-tree-sitter";
import {
  NodeMatcher,
  NodeFinder,
  SelectionExtractor,
  NodeMatcherAlternative,
  ScopeType,
  SelectionWithEditor,
} from "../typings/Types";
import {
  simpleSelectionExtractor,
  argumentSelectionExtractor,
  selectWithLeadingDelimiter,
  selectWithTrailingDelimiter,
  unwrapSelectionExtractor as conditionSelectionExtractor,
} from "./nodeSelectors";
import {
  typedNodeFinder,
  patternFinder,
  argumentNodeFinder,
} from "./nodeFinders";

export function matcher(
  finder: NodeFinder,
  selector: SelectionExtractor = simpleSelectionExtractor
): NodeMatcher {
  return function (selection: SelectionWithEditor, node: SyntaxNode) {
    const targetNode = finder(node, selection.selection);
    return targetNode != null
      ? [
          {
            node: targetNode,
            selection: selector(selection.editor, targetNode),
          },
        ]
      : null;
  };
}

export function composedMatcher(
  finders: NodeFinder[],
  selector: SelectionExtractor = simpleSelectionExtractor
): NodeMatcher {
  return function (selection: SelectionWithEditor, initialNode: SyntaxNode) {
    let returnNode: SyntaxNode = initialNode;
    for (const finder of finders) {
      const foundNode = finder(returnNode, selection.selection);
      if (foundNode == null) {
        return null;
      }
      returnNode = foundNode;
    }
    return [
      {
        node: returnNode,
        selection: selector(selection.editor, returnNode),
      },
    ];
  };
}

export function typeMatcher(...typeNames: string[]) {
  return matcher(typedNodeFinder(...typeNames));
}

export function patternMatcher(...patterns: string[]): NodeMatcher {
  return matcher(patternFinder(...patterns));
}

export function argumentMatcher(...parentTypes: string[]): NodeMatcher {
  return matcher(
    argumentNodeFinder(...parentTypes),
    argumentSelectionExtractor()
  );
}

export function conditionMatcher(...patterns: string[]): NodeMatcher {
  return matcher(patternFinder(...patterns), conditionSelectionExtractor);
}

/**
 * Given `patterns`, creates a node matcher that will add leading delimiter to
 * removal range.
 * @param patterns Patterns for pattern finder
 * @returns A node matcher
 */
export function prefixedMatcher(...patterns: string[]): NodeMatcher {
  return matcher(patternFinder(...patterns), selectWithLeadingDelimiter);
}

/**
 * Given `patterns`, creates a node matcher that will add trailing delimiter to
 * removal range.
 * @param patterns Patterns for pattern finder
 * @returns A node matcher
 */
export function suffixedMatcher(...patterns: string[]): NodeMatcher {
  return matcher(patternFinder(...patterns), selectWithTrailingDelimiter);
}

/**
 * Create a new matcher that will try the given matchers in sequence until one
 * returns non-null
 * @param matchers A list of matchers to try in sequence until one doesn't
 * return null
 * @returns A NodeMatcher that tries the given matchers in sequence
 */
export function cascadingMatcher(...matchers: NodeMatcher[]): NodeMatcher {
  return (selection: SelectionWithEditor, node: SyntaxNode) => {
    for (const matcher of matchers) {
      const match = matcher(selection, node);
      if (match != null) {
        return match;
      }
    }

    return null;
  };
}

export const notSupported: NodeMatcher = (
  selection: SelectionWithEditor,
  node: SyntaxNode
) => {
  throw new Error("Node type not supported");
};

export function createPatternMatchers(
  nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>>
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
