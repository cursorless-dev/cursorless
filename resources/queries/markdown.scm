;; https://github.com/tree-sitter-grammars/tree-sitter-markdown/blob/main/src/grammar.json

(document) @textFragment @section.iteration

(html_block) @comment

;;!! * hello * stuff
;;!  ^^^^^^^^^^^^^^^
(list) @list @collectionItem.iteration

;;!! # Title
;;!    ^^^^^
;;!! xxxxxxx
;;!  -------
(section
  (atx_heading
    (_)
    heading_content: (_) @name
  ) @name.removal
  (#shrink-to-match! @name "^\\s*(?<keep>.*)$")
) @name.domain

;;!! - 0
;;!    ^
;;!  ---
(list
  (list_item)? @collectionItem.leading.endOf
  .
  (list_item
    (_) @collectionItem.prefix
    (paragraph) @collectionItem.start.startOf
  ) @collectionItem.end.endOf @collectionItem.domain
  .
  (list_item)? @collectionItem.trailing.startOf
  (#trim-end! @collectionItem.end.endOf)
  (#trim-end! @collectionItem.domain)
  (#insertion-delimiter! @collectionItem.start.startOf "\n")
)

;;!! ```
;;!  ^^^
;;!! hello
;;!  -----
;;!  #####
;;!! ```
;;!  ^^^
(
  (fenced_code_block
    (fenced_code_block_delimiter) @interior.start.endOf
    .
    (block_continuation)
    (fenced_code_block_delimiter) @interior.end.startOf
  ) @notebookCell
  (#trim-end! @notebookCell)
  (#insertion-delimiter! @notebookCell "\n\n")
)

;;!! ```python
;;!  ^^^^^^^^^
;;!! pass
;;!  ----
;;!  ####
;;!! ```
;;!  ^^^
(
  (fenced_code_block
    (info_string) @interior.start.endOf
    (fenced_code_block_delimiter) @interior.end.startOf
  ) @notebookCell
  (#trim-end! @notebookCell)
  (#insertion-delimiter! @notebookCell "\n\n")
)

;;!! # H1
;;!! ## H2
(
  (section) @section @section.removal
  (#trim-end! @section)
)

;;!! # H1
(
  (section
    (atx_heading
      (atx_h1_marker)
    )
  ) @sectionLevelOne @sectionLevelOne.removal
  (#trim-end! @sectionLevelOne)
)
;;!! ## H2
(
  (section
    (atx_heading
      (atx_h2_marker)
    )
  ) @sectionLevelTwo @sectionLevelTwo.removal
  (#trim-end! @sectionLevelTwo)
)
(
  (section
    (atx_heading
      (atx_h3_marker)
    )
  ) @sectionLevelThree @sectionLevelThree.removal
  (#trim-end! @sectionLevelThree)
)
(
  (section
    (atx_heading
      (atx_h4_marker)
    )
  ) @sectionLevelFour @sectionLevelFour.removal
  (#trim-end! @sectionLevelFour)
)
(
  (section
    (atx_heading
      (atx_h5_marker)
    )
  ) @sectionLevelFive @sectionLevelFive.removal
  (#trim-end! @sectionLevelFive)
)
(
  (section
    (atx_heading
      (atx_h6_marker)
    )
  ) @sectionLevelSix @sectionLevelSix.removal
  (#trim-end! @sectionLevelSix)
)

(
  (section
    (atx_heading) @section.iteration.start.endOf
  ) @section.iteration.end.endOf
  (#trim-end! @section.iteration.end.endOf)
)
