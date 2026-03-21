;;!! <foo>bar</foo>
;;!  ^^^^^^^^^^^^^^
(jsx_element) @xmlElement

;;!! <foo>bar</foo>
;;!       ^^^
(jsx_element
  (jsx_opening_element) @interior.start.endOf @xmlElement.iteration.start.endOf
  (jsx_closing_element) @interior.end.startOf @xmlElement.iteration.end.startOf
)

;;!! <foo>bar</foo>
;;!       ^^^
(jsx_element
  (jsx_opening_element) @xmlStartTag.iteration.start.endOf @xmlEndTag.iteration.start.endOf @xmlBothTags.iteration.start.endOf
  (jsx_closing_element) @xmlStartTag.iteration.end.startOf @xmlEndTag.iteration.end.startOf @xmlBothTags.iteration.end.startOf
)

;;!! <foo>bar</foo>
;;!  ^^^^^---------
(jsx_element
  (jsx_opening_element) @xmlStartTag @xmlBothTags
  (#allow-multiple! @xmlBothTags)
) @_.domain

;;!! <foo>bar</foo>
;;!  --------^^^^^^
(jsx_element
  (jsx_closing_element) @xmlEndTag @xmlBothTags
  (#allow-multiple! @xmlBothTags)
) @_.domain

;; Defines `name` scope for JSX fragment opening element
;;!! <></>
;;!  {}
;;!  --
(jsx_opening_element
  "<" @name.start.endOf
  .
  ">" @name.end.startOf
) @_.domain

;; Defines `name` scope for JSX fragment closing element
;;!! <></>
;;!     {}
;;!    ---
(jsx_closing_element
  "</" @name.start.endOf
  .
  ">" @name.end.startOf
) @_.domain

;;!! <foo/>
(jsx_self_closing_element) @xmlElement

;;!! <aaa bbb="ccc" />
;;!       ^^^^^^^^^
(jsx_attribute) @attribute

;;!! <aaa bbb="ccc" />
;;!       ^^^
(jsx_attribute
  (property_identifier) @collectionKey
  (_)? @_.trailing.startOf
) @_.domain

;;!! <aaa bbb="ccc" />
;;!           ^^^^^
;;!          xxxxxx
;;!       ---------
(jsx_attribute
  (_) @_.leading.endOf
  (_) @value
) @_.domain

;;!! <aaa />
;;!   ^^^^
(jsx_self_closing_element
  "<" @attribute.iteration.start.endOf @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "/>" @attribute.iteration.end.startOf @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)

;;!! <aaa></aaa>
;;!   ^^^
(jsx_opening_element
  "<" @attribute.iteration.start.endOf @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  ">" @attribute.iteration.end.startOf @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)

;;!! <div>text</div>
;;!       ^^^^
;;!! <div>({})</div>
;;!       ^^^^
(
  (jsx_element) @textFragment
  (#child-range! @textFragment 0 -1 true true)
)
