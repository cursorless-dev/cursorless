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
    (_) @prefix
    (paragraph
      (inline) @collectionItem
    )
  ) @collectionItem.domain @collectionItem.removal
  (#trim-end! @collectionItem.domain)
  (#insertion-delimiter! @collectionItem "\n")
  (#insertion-prefix! @collectionItem @prefix)
)
