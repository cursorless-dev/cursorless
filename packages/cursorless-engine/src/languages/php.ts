import { Selection, TextEditor } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { SimpleScopeTypeType } from "@cursorless/common";
import { NodeMatcherAlternative, SelectionWithContext } from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  argumentMatcher,
  cascadingMatcher,
  createPatternMatchers,
  leadingMatcher,
  matcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import { getNodeRange } from "../util/nodeSelectors";

// Taken from https://www.php.net/manual/en/language.operators.assignment.php
const assignmentOperators = [
  "=",
  // Arithmetic
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**=",
  // Bitwise
  "&=",
  "|=",
  "^=",
  "<<=",
  ">>=",
  // Other
  ".=",
  "??=",
];

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
  ifStatement: "if_statement",
  name: [
    "assignment_expression[left]",
    "class_declaration[name]",
    "function_definition[name]",
    "method_declaration[name]",
  ],
  type: cascadingMatcher(
    trailingMatcher(["~cast_expression[type]"]),
    matcher(patternFinder("cast_expression[type]"), castTypeExtractor),
  ),

  namedFunction: trailingMatcher(
    [
      "function_definition",
      "assignment_expression.anonymous_function_creation_expression",
      "assignment_expression.arrow_function",
    ],
    [";"],
  ),
  functionCall: ["function_call_expression", "object_creation_expression"],
  functionName: ["function_definition[name]", "method_declaration[name]"],

  value: leadingMatcher(
    [
      "array_element_initializer[1]",
      "assignment_expression[right]",
      "augmented_assignment_expression[right]",
      "return_statement[0]",
      "yield_expression[0]",
    ],
    assignmentOperators.concat(["=>"]),
  ),

  collectionKey: trailingMatcher(["array_element_initializer[0]"], ["=>"]),

  argumentOrParameter: argumentMatcher("arguments", "formal_parameters"),
};
export default createPatternMatchers(nodeMatchers);
