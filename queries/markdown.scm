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
      (inline) @_.leading.start.endOf
    )
  )?
  .
  (list_item
    (_) @dummy @_.extended.start
    (paragraph
      (inline) @collectionItem @_.extended.end @_.trailing.start.endOf
    )
  ) @_.domain @_.leading.end.startOf
  .
  (list_item)? @_.trailing.end.startOf
  (#trim-end! @_.domain)
  (#insertion-delimiter! @collectionItem "\n")
  (#insertion-prefix! @collectionItem @dummy)
)
