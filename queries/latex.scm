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
  (begin) @xmlStartTag @environment.interior.start.endOf @xmlElement.interior.start.endOf
  (end) @xmlEndTag @environment.interior.end.startOf @xmlElement.interior.end.startOf
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
