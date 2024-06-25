(document) @textFragment

(html_block) @comment

;;!! * hello * stuff
;;!  ^^^^^^^^^^^^^^^
(list) @list

;;!! # Title
;;!    ^^^^^
;;!! xxxxxxx
;;!  -------
(section
  (atx_heading
    (_)
    heading_content: (_) @name
  ) @_.removal
  (#shrink-to-match! @name "^\\s*(?<keep>.*)$")
) @_.domain

;;!! - 0
;;!    ^
;;!  ---
(list
  (list_item
    (paragraph
      (inline) @_.leading.endOf
    )
  )?
  .
  (list_item
    (_) @_.prefix
    (paragraph
      (inline) @collectionItem
    )
  ) @_.domain
  .
  (list_item)? @_.trailing.startOf
  (#trim-end! @_.domain)
  (#insertion-delimiter! @collectionItem "\n")
)

(list) @collectionItem.iteration

;;!! ```
;;!  ^^^
;;!! hello
;;!  -----
;;!  #####
;;!! ```
;;!  ^^^
(
  (fenced_code_block
    (fenced_code_block_delimiter) @_.interior.start.endOf
    .
    (block_continuation)
    (fenced_code_block_delimiter) @_.interior.end.startOf
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
    (info_string) @_.interior.start.endOf
    (fenced_code_block_delimiter) @_.interior.end.startOf
  ) @notebookCell
  (#trim-end! @notebookCell)
  (#insertion-delimiter! @notebookCell "\n\n")
)
