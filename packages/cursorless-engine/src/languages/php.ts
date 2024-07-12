import { Selection, SimpleScopeTypeType, TextEditor } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { NodeMatcherAlternative, SelectionWithContext } from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  argumentMatcher,
  cascadingMatcher,
  createPatternMatchers,
  matcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import { getNodeRange } from "../util/nodeSelectors";

/**
 * Given a node representing the text of a type cast, will return the
 * content range as the text inner type, and the outside range includes
 * the surrounding parentheses, so that "chuck type" deletes the parens
 * @param editor The editor containing the node
 * @param node The node to extract from; will be the content of the type cast without the surrounding parens
 * @returns The selection with context
 */
function castTypeExtractor(
  editor: TextEditor,
  node: SyntaxNode,
): SelectionWithContext {
  const range = getNodeRange(node);
  const contentRange = range;
  const leftParenRange = getNodeRange(node.previousSibling!);
  const rightParenRange = getNodeRange(node.nextSibling!.nextSibling!);
  const removalRange = range.with(leftParenRange.start, rightParenRange.start);

  return {
    selection: new Selection(contentRange.start, contentRange.end),
    context: {
      removalRange,
    },
  };
}

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  type: cascadingMatcher(
    trailingMatcher(["~cast_expression[type]"]),
    matcher(patternFinder("cast_expression[type]"), castTypeExtractor),
  ),

  argumentOrParameter: argumentMatcher("arguments", "formal_parameters"),
};
export default createPatternMatchers(nodeMatchers);
