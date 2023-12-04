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
(
  (list_item
    (_) @dummy @_.insertion.start
    (paragraph
      (inline) @collectionItem @_.insertion.end
    )
  ) @_.domain @_.removal
  (#trim-end! @_.domain)
  (#insertion-delimiter! @collectionItem "\n")
  (#insertion-prefix! @collectionItem @dummy)
)
