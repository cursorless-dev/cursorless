import { SyntaxNode } from "web-tree-sitter";
import {
  matcher,
  cascadingMatcher,
  patternMatcher,
  createPatternMatchers,
  argumentMatcher,
  trailingMatcher,
  conditionMatcher,
} from "../util/nodeMatchers";
import {
  NodeMatcher,
  NodeMatcherAlternative,
  ScopeType,
  SelectionWithEditor,
} from "../typings/Types";
import {
  getNodeInternalRange,
  getNodeRange,
  pairSelectionExtractor,
  selectWithLeadingDelimiter,
  simpleSelectionExtractor,
} from "../util/nodeSelectors";
import { patternFinder } from "../util/nodeFinders";

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-typescript/4c20b54771e4b390ee058af2930feb2cd55f2bf8/typescript/src/node-types.json \
//   | jq '[.[] | select(.type == "statement" or .type == "declaration") | .subtypes[].type]'
const STATEMENT_TYPES = [
  "abstract_class_declaration",
  "ambient_declaration",
  "break_statement",
  "class_declaration",
  "continue_statement",
  "debugger_statement",
  "declaration",
  "do_statement",
  "empty_statement",
  "enum_declaration",
  "export_statement",
  "expression_statement",
  "for_in_statement",
  "for_statement",
  "function_declaration",
  "function_signature",
  "generator_function_declaration",
  "if_statement",
  "import_alias",
  "import_statement",
  "interface_declaration",
  "internal_module",
  "labeled_statement",
  "lexical_declaration",
  "module",
  "return_statement",
  //   "statement_block", This is disabled since we want the whole statement and not just the block
  "switch_statement",
  "throw_statement",
  "try_statement",
  "type_alias_declaration",
  "variable_declaration",
  "while_statement",
  "with_statement",
];

const getStartTag = patternMatcher("jsx_element.jsx_opening_element!");
const getEndTag = patternMatcher("jsx_element.jsx_closing_element!");

const getTags = (selection: SelectionWithEditor, node: SyntaxNode) => {
  const startTag = getStartTag(selection, node);
  const endTag = getEndTag(selection, node);
  return startTag != null && endTag != null ? startTag.concat(endTag) : null;
};

function typeMatcher(): NodeMatcher {
  const delimiterSelector = selectWithLeadingDelimiter(":");
  return function (selection: SelectionWithEditor, node: SyntaxNode) {
    if (
      node.parent?.type === "new_expression" &&
      node.type !== "new" &&
      node.type !== "arguments"
    ) {
      const identifierNode = node.parent.children.find(
        (n) => n.type === "identifier"
      );
      const argsNode = node.parent.children.find(
        (n) => n.type === "type_arguments"
      );
      if (identifierNode && argsNode) {
        return [
          {
            node,
            selection: pairSelectionExtractor(
              selection.editor,
              identifierNode,
              argsNode
            ),
          },
        ];
      } else if (identifierNode) {
        return [
          {
            node: identifierNode,
            selection: simpleSelectionExtractor(
              selection.editor,
              identifierNode
            ),
          },
        ];
      }
    }

    const typeAnnotationNode = node.children.find((child) =>
      ["type_annotation", "opting_type_annotation"].includes(child.type)
    );
    const targetNode = typeAnnotationNode?.lastChild;

    if (targetNode) {
      return [
        {
          node: targetNode,
          selection: delimiterSelector(selection.editor, targetNode),
        },
      ];
    }
    return null;
  };
}

function valueMatcher() {
  const pFinder = patternFinder(
    "assignment_expression[right]",
    "augmented_assignment_expression[right]",
    "*[value]",
    "shorthand_property_identifier"
  );
  return matcher(
    (node: SyntaxNode) =>
      node.type === "jsx_attribute" ? node.lastChild : pFinder(node),
    selectWithLeadingDelimiter(
      ":",
      "=",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "**=",
      "&=",
      "|=",
      "^=",
      "<<=",
      ">>="
    )
  );
}

const mapTypes = ["object", "object_pattern"];
const listTypes = ["array", "array_pattern"];

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  map: mapTypes,
  list: listTypes,
  string: ["string", "template_string"],
  collectionKey: trailingMatcher(
    [
      "pair[key]",
      "jsx_attribute.property_identifier!",
      "shorthand_property_identifier",
    ],
    [":"]
  ),
  collectionItem: argumentMatcher(...mapTypes, ...listTypes),
  value: cascadingMatcher(
    valueMatcher(),
    patternMatcher("return_statement.~return!"),
    patternMatcher("yield_expression.~yield!")
  ),
  ifStatement: "if_statement",
  anonymousFunction: ["arrow_function", "function"],
  name: [
    "*[name]",
    "optional_parameter.identifier!",
    "required_parameter.identifier!",
    "augmented_assignment_expression[left]",
  ],
  comment: "comment",
  regularExpression: "regex",
  className: ["class_declaration[name]", "class[name]"],
  functionCall: ["call_expression", "new_expression"],
  functionCallee: [
    "call_expression.identifier!",
    "call_expression.call_expression!",
    "new_expression.identifier!",
  ],
  statement: STATEMENT_TYPES.map((type) => `export_statement?.${type}`),
  condition: conditionMatcher("*[condition]"),
  class: [
    "export_statement?.class_declaration", // export class | class
    "export_statement.class", // export default class
  ],
  functionName: [
    // function
    "function_declaration[name]",
    // generator function
    "generator_function_declaration[name]",
    // export default function
    "function[name]",
    // class method
    "method_definition[name]",
    // class arrow method
    "public_field_definition[name].arrow_function",
    // const foo = function() { }
    "variable_declarator[name].function",
    // const foo = () => { }
    "variable_declarator[name].arrow_function",
    // foo = function() { }
    "assignment_expression[left].function",
    // foo = () => { }
    "assignment_expression[left].arrow_function",
  ],
  namedFunction: [
    // [export] function
    "export_statement?.function_declaration",
    // export default function
    // NB: We require export statement because otherwise it is an anonymous
    // function
    "export_statement.function",
    // export default arrow
    "export_statement.arrow_function",
    // class method
    "method_definition",
    // class arrow method
    "public_field_definition.arrow_function",
    // [export] const foo = function() { }
    "export_statement?.lexical_declaration.variable_declarator.function",
    // [export] const foo = () => { }
    "export_statement?.lexical_declaration.variable_declarator.arrow_function",
    // foo = function() { }
    "assignment_expression.function",
    // foo = () => { }
    "assignment_expression.arrow_function",
    // foo = function*() { }
    "generator_function_declaration",
  ],
  type: cascadingMatcher(
    // Typed parameters, properties, and functions
    typeMatcher(),
    // matcher(findTypeNode, selectWithLeadingDelimiter(":")),
    // Type alias/interface declarations
    patternMatcher(
      "export_statement?.type_alias_declaration",
      "export_statement?.interface_declaration"
    )
  ),
  argumentOrParameter: argumentMatcher("formal_parameters", "arguments"),
  // XML, JSX
  attribute: ["jsx_attribute"],
  xmlElement: ["jsx_element", "jsx_self_closing_element"],
  xmlBothTags: getTags,
  xmlStartTag: getStartTag,
  xmlEndTag: getEndTag,
};

export const patternMatchers = createPatternMatchers(nodeMatchers);

export function stringTextFragmentExtractor(
  node: SyntaxNode,
  _selection: SelectionWithEditor
) {
  if (node.type === "string_fragment" || node.type === "regex_pattern") {
    return getNodeRange(node);
  }

  if (node.type === "template_string") {
    // Exclude starting and ending quotation marks
    return getNodeInternalRange(node);
  }

  return null;
}
