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
