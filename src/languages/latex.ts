import {
  createPatternMatchers,
  cascadingMatcher,
  matcher,
} from "../util/nodeMatchers";
import {
  NodeMatcherAlternative,
  ScopeType,
  SelectionWithContext,
} from "../typings/Types";
import { Selection, TextEditor } from "vscode";
import { patternFinder } from "../util/nodeFinders";
import { SyntaxNode } from "web-tree-sitter";

const COMMANDS = [
  "command",
  "displayed_equation",
  "inline_formula",
  "math_set",
  "block_comment",
  "package_include",
  "class_include",
  "latex_include",
  "biblatex_include",
  "bibtex_include",
  "graphics_include",
  "svg_include",
  "inkscape_include",
  "verbatim_include",
  "import_include",
  "caption",
  "citation",
  "label_definition",
  "label_reference",
  "label_reference_range",
  "label_number",
  "new_command_definition",
  "old_command_definition",
  "let_command_definition",
  "environment_definition",
  "glossary_entry_definition",
  "glossary_entry_reference",
  "acronym_definition",
  "acronym_reference",
  "theorem_definition",
  "color_definition",
  "color_set_definition",
  "color_reference",
  "tikz_library_import",
];

const GROUPS = [
  "curly_group",
  "curly_group_text",
  "curly_group_text_list",
  "curly_group_path",
  "curly_group_path_list",
  "curly_group_command_name",
  "curly_group_key_value",
  "curly_group_glob_pattern",
  "curly_group_impl",
  "brack_group",
  "brack_group_text",
  "brack_group_argc",
  "brack_group_key_value",
  "mixed_group",
];

const SECTIONING = [
  "part",
  "chapter",
  "section",
  "subsection",
  "subsubsection",
  "paragraph",
  "subparagraph",
];

const ENVIRONMENTS = [
  "generic_environment",
  "comment_environment",
  "verbatim_environment",
  "listing_environment",
  "minted_environment",
  "pycode_environment",
];

const sectioningText = SECTIONING.map((s) => `${s}[text]`);
const sectioningCommand = SECTIONING.map((s) => `${s}[command]`);
const commandXGroup = GROUPS.map((group) =>
  COMMANDS.map((cmd) => `${cmd}.${group}!`)
).flat();

function unwrapParenExtractor(
  editor: TextEditor,
  node: SyntaxNode
): SelectionWithContext {
  let startIndex = node.startIndex;
  let endIndex = node.endIndex;
  const parens = [
    ["{", "}"],
    ["[", "]"],
  ];
  if (
    parens.some(
      ([left, right]) => node.text.startsWith(left) && node.text.endsWith(right)
    )
  ) {
    startIndex += 1;
    endIndex -= 1;
  }
  return {
    selection: new Selection(
      editor.document.positionAt(startIndex),
      editor.document.positionAt(endIndex)
    ),
    context: {},
  };
}

function extendToNamedSiblingIfExists(
  editor: TextEditor,
  node: SyntaxNode
): SelectionWithContext {
  let startIndex = node.startIndex;
  let endIndex = node.endIndex;
  let sibling = node.nextNamedSibling;

  if (sibling != null && sibling.isNamed) {
    endIndex = sibling.endIndex;
  }

  return {
    selection: new Selection(
      editor.document.positionAt(startIndex),
      editor.document.positionAt(endIndex)
    ),
    context: {},
  };
}

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  argumentOrParameter: matcher(
    patternFinder(
      ...commandXGroup
        .concat(["begin[name]", "end[name]"])
        .concat(sectioningText)
    ),
    unwrapParenExtractor
  ),

  functionCall: cascadingMatcher(
    matcher(patternFinder(...COMMANDS.concat(["begin", "end"]))),
    matcher(patternFinder(...sectioningCommand), extendToNamedSiblingIfExists)
  ),

  name: matcher(patternFinder(...sectioningText), unwrapParenExtractor),
  type: "command_name",

  collectionItem: "enum_item",

  comment: ["block_comment", "line_comment"],

  // TODO: use other scope(s)? adding individual scopes is probably too much? (part, chapter, section, subsection, subsubsection, paragraph, subparagraph)
  xmlStartTag: SECTIONING,

  // TODO: eventually add scope instead of reusing xmlElement
  xmlElement: ENVIRONMENTS,
};

export default createPatternMatchers(nodeMatchers);
