;; https://github.com/latex-lsp/tree-sitter-latex/blob/master/src/grammar.json

(source_file) @section.iteration

[
  (block_comment)
  (line_comment)
] @comment @textFragment

(_
  (command_name) @functionCallee
) @functionCallee.domain

(part) @part
(chapter) @chapter
(section) @section
(subsection) @subSection
(subsubsection) @subSubSection
(paragraph) @namedParagraph
(subparagraph) @subParagraph

(_
  (begin) @xmlStartTag
  (end) @xmlEndTag
) @environment @xmlElement @_.domain

;;!! \begin{quote} Hello \end{quote}
;;!               ^^^^^^^
(_
  (begin) @interior.start.endOf @textFragment.start.endOf
  (end) @interior.end.startOf @textFragment.end.startOf
)

(_
  (begin) @xmlBothTags
  (#allow-multiple! @xmlBothTags)
) @_.domain

(_
  (end) @xmlBothTags
  (#allow-multiple! @xmlBothTags)
) @_.domain

(operator
  [
    "<"
    ">"
  ] @disqualifyDelimiter
)

;;!! \item one \LaTeX
;;!        ^^^^^^^^^^
(enum_item
  (text) @collectionItem.start.startOf
) @collectionItem.leading.startOf @collectionItem.end.endOf

(generic_environment
  (begin) @collectionItem.iteration.start.endOf
  (end) @collectionItem.iteration.end.startOf
) @list @collectionItem.iteration.domain

;;!! \section{foo bar}
;;!           ^^^^^^^
(
  (_
    text: (_
      (_) @name @argumentOrParameter
    ) @_.removal
  ) @name.domain
  (#type?
    @name.domain
    subparagraph
    paragraph
    subsubsection
    subsection
    section
    chapter
    part
  )
)

;;!! \begin{quote}
;; !        ^^^^^
(begin
  name: (_
    text: (_) @name @argumentOrParameter
  ) @_.removal
) @name.domain

;;!! \end{quote}
;; !      ^^^^^
(end
  name: (_
    text: (_) @name @argumentOrParameter
  ) @_.removal
) @name.domain

[
  (displayed_equation)
  (generic_command)
  (inline_formula)
  (block_comment)
  (package_include)
  (class_include)
  (latex_include)
  (biblatex_include)
  (bibtex_include)
  (graphics_include)
  (svg_include)
  (inkscape_include)
  (verbatim_include)
  (import_include)
  (caption)
  (citation)
  (label_definition)
  (label_reference)
  (label_reference_range)
  (label_number)
  (new_command_definition)
  (old_command_definition)
  (let_command_definition)
  (environment_definition)
  (glossary_entry_definition)
  (glossary_entry_reference)
  (acronym_definition)
  (acronym_reference)
  (theorem_definition)
  (color_definition)
  (color_set_definition)
  (color_reference)
  (tikz_library_import)
  (begin)
  (end)
] @functionCall @argumentOrParameter.iteration

(
  (_
    command: _ @functionCall.start @argumentOrParameter.iteration.start
    .
    (_)? @functionCall.end @argumentOrParameter.iteration.end
  ) @_dummy
  (#type?
    @_dummy
    subparagraph
    paragraph
    subsubsection
    subsection
    section
    chapter
    part
  )
)

(
  (_
    [
      (curly_group)
      (curly_group_text)
      (curly_group_text_list)
      (curly_group_path)
      (curly_group_path_list)
      (curly_group_command_name)
      (curly_group_key_value)
      (curly_group_glob_pattern)
      (curly_group_impl)
      (brack_group)
      (brack_group_text)
      (brack_group_argc)
      (brack_group_key_value)
    ] @argumentOrParameter @_.removal
  ) @_dummy
  (#character-range! @argumentOrParameter 1 -1)
  (#type?
    @_dummy
    displayed_equation
    generic_command
    inline_formula
    math_set
    block_comment
    package_include
    class_include
    latex_include
    biblatex_include
    bibtex_include
    graphics_include
    svg_include
    inkscape_include
    verbatim_include
    import_include
    caption
    citation
    label_definition
    label_reference
    label_reference_range
    label_number
    new_command_definition
    old_command_definition
    let_command_definition
    environment_definition
    glossary_entry_definition
    glossary_entry_reference
    acronym_definition
    acronym_reference
    theorem_definition
    color_definition
    color_set_definition
    color_reference
    tikz_library_import
  )
)
