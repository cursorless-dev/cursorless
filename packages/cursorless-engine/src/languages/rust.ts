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
} from "../util/nodeMatchers";
import {
  makeNodePairSelection,
  makeRangeFromPositions,
} from "../util/nodeSelectors";

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
};

export default createPatternMatchers(nodeMatchers);
