;; https://github.com/latex-lsp/tree-sitter-latex/blob/master/src/grammar.json

[
  (block_comment)
  (line_comment)
] @comment

(command_name) @functionCallee

(part) @part
(chapter) @chapter
(section) @section
(subsection) @subSection
(subsubsection) @subSubSection
(paragraph) @namedParagraph
(subparagraph) @subParagraph

(_
  (begin) @xmlStartTag @interior.start.endOf
  (end) @xmlEndTag @interior.end.startOf
) @environment @xmlElement @_.domain

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
(
  (_
    (enum_item
      (text) @collectionItem.start.startOf
    ) @collectionItem.leading.startOf @collectionItem.end.endOf
  )
)

(generic_environment
  (begin) @collectionItem.iteration.start.endOf
  (end) @collectionItem.iteration.end.startOf
) @collectionItem.iteration.domain

;;!! \section{foo bar}
;;!           ^^^^^^^
(
  (_
    text: (_
      (_) @name
    ) @name.removal
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
    text: (_) @name
  )
) @_.domain

;;!! \end{quote}
;; !      ^^^^^
(end
  name: (_
    text: (_) @name
  )
) @_.domain

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
] @functionCall

(subparagraph
  command: _ @functionCall.start
  .
  (_)? @functionCall.end
)
(paragraph
  command: _ @functionCall.start
  .
  (_)? @functionCall.end
)
(subsubsection
  command: _ @functionCall.start
  .
  (_)? @functionCall.end
)
(subsection
  command: _ @functionCall.start
  .
  (_)? @functionCall.end
)
(section
  command: _ @functionCall.start
  .
  (_)? @functionCall.end
)
(chapter
  command: _ @functionCall.start
  .
  (_)? @functionCall.end
)
(part
  command: _ @functionCall.start
  .
  (_)? @functionCall.end
)
