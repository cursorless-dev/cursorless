import { Selection } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { SimpleScopeTypeType } from "@cursorless/common";
import { NodeFinder, NodeMatcherAlternative } from "../typings/Types";
import { argumentNodeFinder, patternFinder } from "../util/nodeFinders";
import {
  argumentMatcher,
  cascadingMatcher,
  conditionMatcher,
  createPatternMatchers,
  leadingMatcher,
  matcher,
  patternMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import {
  argumentSelectionExtractor,
  childRangeSelector,
} from "../util/nodeSelectors";
import { branchMatcher } from "./branchMatcher";
import { ternaryBranchMatcher } from "./ternaryBranchMatcher";

export const getTypeNode = (node: SyntaxNode) =>
  node.children.find((child) => child.type === "type") ?? null;

const dictionaryTypes = ["dictionary", "dictionary_comprehension"];
const listTypes = ["list", "list_comprehension", "set"];

function itemNodeFinder(
  parentType: string,
  childType: string,
  excludeFirstChild: boolean = false,
): NodeFinder {
  const finder = argumentNodeFinder(parentType);
  return (node: SyntaxNode, selection?: Selection) => {
    const childNode = finder(node, selection);
    if (
      childNode?.type === childType &&
      (!excludeFirstChild ||
        childNode.id !== childNode.parent?.firstNamedChild?.id)
    ) {
      return childNode;
    }
    return null;
  };
}

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  map: dictionaryTypes,
  list: listTypes,
  collectionItem: cascadingMatcher(
    matcher(
      itemNodeFinder("import_from_statement", "dotted_name", true),
      argumentSelectionExtractor(),
    ),
    matcher(
      itemNodeFinder("global_statement", "identifier"),
      argumentSelectionExtractor(),
    ),
  ),
  collectionKey: trailingMatcher(["pair[key]"], [":"]),
  ifStatement: "if_statement",
  anonymousFunction: "lambda?.lambda",
  functionCall: "call",
  functionCallee: "call[function]",
  comment: "comment",
  condition: cascadingMatcher(
    conditionMatcher("*[condition]"),

    // Comprehensions and match statements
    leadingMatcher(["*.if_clause![0]"], ["if"]),

    // Ternaries
    patternMatcher("conditional_expression[1]"),
  ),
  type: leadingMatcher(
    ["function_definition[return_type]", "*[type]"],
    [":", "->"],
  ),
  name: [
    "assignment[left]",
    "augmented_assignment[left]",
    "typed_parameter.identifier!",
    "parameters.identifier!",
    "*[name]",
  ],
  value: cascadingMatcher(
    leadingMatcher(
      ["assignment[right]", "augmented_assignment[right]", "~subscript[value]"],
      [
        ":",
        "=",
        "+=",
        "-=",
        "*=",
        "/=",
        "%=",
        "//=",
        "**=",
        "&=",
        "|=",
        "^=",
        "<<=",
        ">>=",
      ],
    ),
    patternMatcher("return_statement.~return!"),
  ),
  argumentOrParameter: cascadingMatcher(
    argumentMatcher("parameters", "argument_list"),
    matcher(patternFinder("call.generator_expression!"), childRangeSelector()),
  ),
  branch: cascadingMatcher(
    patternMatcher("case_clause"),
    branchMatcher("if_statement", ["else_clause", "elif_clause"]),
    branchMatcher("while_statement", ["else_clause"]),
    branchMatcher("for_statement", ["else_clause"]),
    branchMatcher("try_statement", [
      "except_clause",
      "finally_clause",
      "else_clause",
      "except_group_clause",
    ]),
    ternaryBranchMatcher("conditional_expression", [0, 2]),
  ),
  switchStatementSubject: "match_statement[subject]",
};

export default createPatternMatchers(nodeMatchers);
