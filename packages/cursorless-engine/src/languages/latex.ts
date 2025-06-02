import type { SimpleScopeTypeType, TextEditor } from "@cursorless/common";
import { Selection } from "@cursorless/common";
import type { Node } from "web-tree-sitter";
import type {
  NodeMatcherAlternative,
  SelectionWithContext,
} from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  ancestorChainNodeMatcher,
  cascadingMatcher,
  createPatternMatchers,
  matcher,
} from "../util/nodeMatchers";

const COMMANDS = [
  "command",
  "displayed_equation",
  "generic_command",
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
  "subparagraph",
  "paragraph",
  "subsubsection",
  "subsection",
  "section",
  "chapter",
  "part",
];

const sectioningText = SECTIONING.map((s) => `${s}[text]`);

function unwrapGroupParens(
  editor: TextEditor,
  node: Node,
): SelectionWithContext {
  return {
    selection: new Selection(
      editor.document.positionAt(node.startIndex + 1),
      editor.document.positionAt(node.endIndex - 1),
    ),
    context: {
      removalRange: new Selection(
        editor.document.positionAt(node.startIndex),
        editor.document.positionAt(node.endIndex),
      ),
    },
  };
}

function extendToNamedSiblingIfExists(
  editor: TextEditor,
  node: Node,
): SelectionWithContext {
  const startIndex = node.startIndex;
  let endIndex = node.endIndex;
  const sibling = node.nextNamedSibling;

  if (sibling != null && sibling.isNamed) {
    endIndex = sibling.endIndex;
  }

  return {
    selection: new Selection(
      editor.document.positionAt(startIndex),
      editor.document.positionAt(endIndex),
    ),
    context: {},
  };
}

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  argumentOrParameter: cascadingMatcher(
    ancestorChainNodeMatcher(
      [patternFinder(...COMMANDS), patternFinder(...GROUPS)],
      1,
      unwrapGroupParens,
    ),
    matcher(
      patternFinder("begin[name]", "end[name]", ...sectioningText),
      unwrapGroupParens,
    ),
  ),
};

export default createPatternMatchers(nodeMatchers);
