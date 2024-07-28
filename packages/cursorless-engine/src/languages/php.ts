import { SimpleScopeTypeType } from "@cursorless/common";
import { NodeMatcherAlternative } from "../typings/Types";
import {
  argumentMatcher,
  createPatternMatchers,
  leadingMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";

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

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
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
