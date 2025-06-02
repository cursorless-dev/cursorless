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
