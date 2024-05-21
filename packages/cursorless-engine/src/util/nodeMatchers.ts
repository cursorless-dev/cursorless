import type { SyntaxNode } from "web-tree-sitter";
import { SimpleScopeTypeType } from "@cursorless/common";
import {
  NodeFinder,
  NodeMatcher,
  NodeMatcherAlternative,
  SelectionExtractor,
  SelectionWithEditor,
} from "../typings/Types";
import {
  ancestorChainNodeFinder,
  argumentNodeFinder,
  chainedNodeFinder,
  patternFinder,
  typedNodeFinder,
} from "./nodeFinders";
import {
  argumentSelectionExtractor,
  selectWithLeadingDelimiter,
  selectWithTrailingDelimiter,
  simpleSelectionExtractor,
  unwrapSelectionExtractor,
} from "./nodeSelectors";
import { unsafeKeys } from "./object";

export function matcher(
  finder: NodeFinder,
  selector: SelectionExtractor = simpleSelectionExtractor,
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
  selector: SelectionExtractor = simpleSelectionExtractor,
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

/**
 * Given a sequence of node finders, returns a new node matcher which applies
 * them in reverse, walking up the ancestor chain from `node`.
 * Returns `null` if any finder in the chain returns null.  For example:
 *
 * ancestorChainNodeMatcher([patternFinder("foo", "bar"), patternFinder("bongo")], 0)
 *
 * is equivalent to:
 *
 * patternFinder("foo.bongo", "bar.bongo")
 *
 * @param nodeFinders A list of node finders to apply in sequence
 * @param nodeToReturn The index of the node from the sequence to return.  For
 * example, `0` returns the top ancestor in the chain
 * @param selector The selector to apply to the final node
 * @returns A node finder which is a chain of the input node finders
 */
export function ancestorChainNodeMatcher(
  nodeFinders: NodeFinder[],
  nodeToReturn: number = 0,
  selector: SelectionExtractor = simpleSelectionExtractor,
) {
  return matcher(
    ancestorChainNodeFinder(nodeToReturn, ...nodeFinders),
    selector,
  );
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
    argumentSelectionExtractor(),
  );
}

export function conditionMatcher(...patterns: string[]): NodeMatcher {
  return matcher(patternFinder(...patterns), unwrapSelectionExtractor);
}

/**
 * Given `patterns`, creates a node matcher that will add leading delimiter to
 * removal range.
 * @param patterns Patterns for pattern finder
 * @returns A node matcher
 */
export function leadingMatcher(
  patterns: string[],
  delimiters: string[] = [],
): NodeMatcher {
  return matcher(
    patternFinder(...patterns),
    selectWithLeadingDelimiter(...delimiters),
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
  delimiters: string[] = [],
): NodeMatcher {
  return matcher(
    patternFinder(...patterns),
    selectWithTrailingDelimiter(...delimiters),
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

export function notSupported(scopeTypeType: SimpleScopeTypeType): NodeMatcher {
  return (_selection: SelectionWithEditor, _node: SyntaxNode) => {
    throw new Error(`Node type '${scopeTypeType}' not supported`);
  };
}

export function createPatternMatchers(
  nodeMatchers: Partial<Record<SimpleScopeTypeType, NodeMatcherAlternative>>,
): Partial<Record<SimpleScopeTypeType, NodeMatcher>> {
  return Object.freeze(
    Object.fromEntries(
      unsafeKeys(nodeMatchers).map((scopeType: SimpleScopeTypeType) => {
        const matcher = nodeMatchers[scopeType];
        if (Array.isArray(matcher)) {
          return [scopeType, patternMatcher(...matcher)];
        } else if (typeof matcher === "string") {
          return [scopeType, patternMatcher(matcher)];
        } else {
          return [scopeType, matcher];
        }
      }),
    ),
  );
}
