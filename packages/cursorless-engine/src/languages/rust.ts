import type { SimpleScopeTypeType, TextEditor } from "@cursorless/common";
import type { Node } from "web-tree-sitter";
import type {
  NodeMatcherAlternative,
  SelectionWithContext,
} from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  argumentMatcher,
  cascadingMatcher,
  createPatternMatchers,
  leadingMatcher,
  matcher,
  patternMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import {
  childRangeSelector,
  makeNodePairSelection,
  makeRangeFromPositions,
} from "../util/nodeSelectors";
import { elseExtractor, elseIfExtractor } from "./elseIfExtractor";

/**
 * Returns "impl_item[type]" node higher in the chain
 * @param node The node which we will start our search from
 * @returns node or null
 */
function implItemTypeFinder(node: Node) {
  if (
    node.parent?.type === "impl_item" &&
    node.parent?.childForFieldName("type")?.equals(node)
  ) {
    return node;
  }
  return null;
}

function traitBoundExtractor(
  editor: TextEditor,
  node: Node,
): SelectionWithContext {
  return {
    selection: makeNodePairSelection(node.children[1], node.lastNamedChild!),
    context: {
      leadingDelimiterRange: makeRangeFromPositions(
        node.children[0].startPosition,
        node.children[1].startPosition,
      ),
    },
  };
}

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  condition: cascadingMatcher(
    patternMatcher("while_expression[condition]", "if_expression[condition]"),
    matcher(
      patternFinder("while_let_expression", "if_let_expression"),
      childRangeSelector(["while", "if", "block"], [], {
        includeUnnamedChildren: true,
      }),
    ),
    leadingMatcher(["*.match_pattern![condition]"], ["if"]),
  ),
  type: cascadingMatcher(
    leadingMatcher(
      [
        "let_declaration[type]",
        "parameter[type]",
        "field_declaration[type]",
        "const_item[type]",
      ],
      [":"],
    ),
    matcher(
      patternFinder(
        "constrained_type_parameter[bounds]",
        "where_predicate[bounds]",
      ),
      traitBoundExtractor,
    ),
    leadingMatcher(["function_item[return_type]"], ["->"]),
    matcher(implItemTypeFinder),
    patternMatcher(
      "struct_item",
      "trait_item",
      "impl_item",
      "array_type[element]",
    ),
  ),
  argumentOrParameter: argumentMatcher(
    "arguments",
    "parameters",
    "meta_arguments",
    "type_parameters",
    "ordered_field_declaration_list",
  ),
  name: cascadingMatcher(
    patternMatcher(
      "let_declaration.identifier!",
      "parameter.identifier!",
      "function_item[name]",
      "struct_item[name]",
      "enum_item[name]",
      "enum_variant[name]",
      "trait_item[name]",
      "const_item[name]",
      "meta_item.identifier!",
      "let_declaration[pattern]",
      "constrained_type_parameter[left]",
      "where_predicate[left]",
      "field_declaration[name]",
    ),
    trailingMatcher(["field_initializer[name]", "field_pattern[name]"], [":"]),
  ),
  branch: cascadingMatcher(
    patternMatcher("match_arm"),
    matcher(patternFinder("else_clause"), elseExtractor("if_expression")),
    matcher(patternFinder("if_expression"), elseIfExtractor()),
  ),
};

export default createPatternMatchers(nodeMatchers);
