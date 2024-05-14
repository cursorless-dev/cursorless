import {
  Range,
  Selection,
  SimpleScopeTypeType,
  TextEditor,
} from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import {
  NodeMatcherAlternative,
  SelectionWithContext,
  SelectionWithEditor,
} from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  ancestorChainNodeMatcher,
  cascadingMatcher,
  createPatternMatchers,
  matcher,
  patternMatcher,
} from "../util/nodeMatchers";

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
  "subparagraph",
  "paragraph",
  "subsubsection",
  "subsection",
  "section",
  "chapter",
  "part",
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

function unwrapGroupParens(
  editor: TextEditor,
  node: SyntaxNode,
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
  node: SyntaxNode,
): SelectionWithContext {
  const startIndex = node.startIndex;
  let endIndex = node.endIndex;
  const sibling = node.nextNamedSibling;

  if (sibling != null && sibling.isNamed()) {
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

function extractItemContent(
  editor: TextEditor,
  node: SyntaxNode,
): SelectionWithContext {
  let contentStartIndex = node.startIndex;

  const label = node.childForFieldName("label");
  if (label == null) {
    const command = node.childForFieldName("command");
    if (command != null) {
      contentStartIndex = command.endIndex + 1;
    }
  } else {
    contentStartIndex = label.endIndex + 1;
  }

  return {
    selection: new Selection(
      editor.document.positionAt(contentStartIndex),
      editor.document.positionAt(node.endIndex),
    ),
    context: {
      leadingDelimiterRange: new Range(
        editor.document.positionAt(node.startIndex),
        editor.document.positionAt(contentStartIndex - 1),
      ),
    },
  };
}

const getStartTag = patternMatcher(`*.begin!`);
const getEndTag = patternMatcher(`*.end!`);

const getTags = (selection: SelectionWithEditor, node: SyntaxNode) => {
  const startTag = getStartTag(selection, node);
  const endTag = getEndTag(selection, node);
  return startTag != null && endTag != null ? startTag.concat(endTag) : null;
};

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

  functionCall: cascadingMatcher(
    matcher(patternFinder(...COMMANDS, "begin", "end")),
    matcher(patternFinder(...sectioningCommand), extendToNamedSiblingIfExists),
  ),

  name: cascadingMatcher(
    matcher(patternFinder(...sectioningText), unwrapGroupParens),
    patternMatcher("begin[name][text]", "end[name][text]"),
  ),
  functionCallee: "command_name",

  collectionItem: matcher(patternFinder("enum_item"), extractItemContent),

  part: "part",
  chapter: "chapter",
  section: "section",
  subSection: "subsection",
  subSubSection: "subsubsection",
  namedParagraph: "paragraph",
  subParagraph: "subparagraph",

  environment: ENVIRONMENTS,
  xmlElement: ENVIRONMENTS,
  xmlBothTags: getTags,
  xmlStartTag: getStartTag,
  xmlEndTag: getEndTag,
};

export default createPatternMatchers(nodeMatchers);
