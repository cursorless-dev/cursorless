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
  chainedNodeFinder,
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

/**
 * Given a list of node finders returns a matcher which applies them in
 * sequence returning null if any of the sequence returns null otherwise
 * returning the output of the final node finder
 * @param nodeFinders A list of node finders to apply in sequence
 * @param selector The selector to apply to the final node
 * @returns A matcher which is a chain of the input node finders
 */
export function chainedMatcher(
  finders: NodeFinder[],
  selector: SelectionExtractor = simpleSelectionExtractor
): NodeMatcher {
  const nodeFinder = chainedNodeFinder(...finders);

  return function (selection: SelectionWithEditor, initialNode: SyntaxNode) {
    const returnNode = nodeFinder(initialNode);

    if (returnNode == null) {
      return null;
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
 * Given `patterns`, creates a node matcher that selects the named child
 * at the specified index of the pattern matched node.
 *
 * @param patterns Patterns for pattern finder
 * @param childIdx Index of child
 * @returns A node matcher
 */
export function childAtIndexMatcher(patterns: string[], childIdx: number): NodeMatcher {
   const finder = patternFinder(...patterns);
  return matcher(
    (node: SyntaxNode) => finder(node)?.namedChild(childIdx) ?? null
  );
}

/**
 * Given `patterns`, creates a node matcher that will add leading delimiter to
 * removal range.
 * @param patterns Patterns for pattern finder
 * @returns A node matcher
 */
export function leadingMatcher(
  patterns: string[],
  delimiters: string[] = []
): NodeMatcher {
  return matcher(
    patternFinder(...patterns),
    selectWithLeadingDelimiter(...delimiters)
  );
}

/**
 * Given `patterns`, creates a node matcher that will add trailing delimiter to
 * removal range.
 * @param patterns Patterns for pattern finder
 * @returns A node matcher
 */
export function trailingMatcher(
  patterns: string[],
  delimiters: string[] = []
): NodeMatcher {
  return matcher(
    patternFinder(...patterns),
    selectWithTrailingDelimiter(...delimiters)
  );
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
