import type { SimpleScopeTypeType } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import type { NodeMatcherAlternative } from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  cascadingMatcher,
  createPatternMatchers,
  matcher,
} from "../util/nodeMatchers";
import { delimitedSelector } from "../util/nodeSelectors";

function isArgumentListDelimiter(node: SyntaxNode) {
  return [",", "(", ")"].includes(node.type) || isAtDelimiter(node);
}

/**
 * Determines whether the given `node` is an `at` delimiter node, used in a css
 * / scss argument list.  For example, the `at` in the call
 * `ellipse(115px 55px at 50% 40%)`
 *
 * @param node The node to check
 * @returns `true` if the node is an `at` delimiter node
 */
function isAtDelimiter(node: SyntaxNode) {
  return node.type === "plain_value" && node.text === "at";
}

/**
 * Matches adjacent nodes returned from {@link siblingFunc} until it reaches a
 * delimiter node.  This is intended to handle the case of multiple values
 * within two delimiters.  e.g. `repeating-linear-gradient(red, orange 50px)`
 * @param siblingFunc returns the previous or next sibling of the current node if present.
 * @returns A non-delimiter node
 */
function findAdjacentArgValues(
  siblingFunc: (node: SyntaxNode) => SyntaxNode | null,
) {
  return (node: SyntaxNode) => {
    // Handle the case where we are the cursor is placed before a delimiter, e.g. "|at"
    // and we erroneously expand in both directions.
    if (isAtDelimiter(node) || node.type === ",") {
      node = node.previousSibling!;
    }

    let nextPossibleRange = siblingFunc(node);

    while (nextPossibleRange && !isArgumentListDelimiter(nextPossibleRange)) {
      node = nextPossibleRange;
      nextPossibleRange = siblingFunc(nextPossibleRange);
    }
    return node;
  };
}

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  argumentOrParameter: cascadingMatcher(
    matcher(
      patternFinder("arguments.*!", "parameters.*!"),
      delimitedSelector(
        (node) => isArgumentListDelimiter(node),
        ", ",
        findAdjacentArgValues((node) => node.previousSibling),
        findAdjacentArgValues((node) => node.nextSibling),
      ),
    ),
  ),
};

export const patternMatchers = createPatternMatchers(nodeMatchers);
