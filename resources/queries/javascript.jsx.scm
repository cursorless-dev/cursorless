;;!! <foo>bar</foo>
;;!  ^^^^^^^^^^^^^^
(jsx_element) @xmlElement

;;!! <foo>bar</foo>
;;!       ^^^
(jsx_element
  (jsx_opening_element) @interior.start.endOf @G_xmlElement_xmlStartTag_xmlEndTag_xmlBothTags.iteration.start.endOf
  (jsx_closing_element) @interior.end.startOf @G_xmlElement_xmlStartTag_xmlEndTag_xmlBothTags.iteration.end.startOf
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
) @name.domain

;; Defines `name` scope for JSX fragment closing element
;;!! <></>
;;!     {}
;;!    ---
(jsx_closing_element
  "</" @name.start.endOf
  .
  ">" @name.end.startOf
) @name.domain

;;!! <foo/>
(jsx_self_closing_element) @xmlElement

;;!! <aaa bbb="ccc" />
;;!       ^^^^^^^^^
(jsx_attribute) @attribute

;;!! <aaa bbb="ccc" />
;;!       ^^^
(jsx_attribute
  (property_identifier) @collectionKey
  (_)? @collectionKey.trailing.startOf
) @collectionKey.domain

;;!! <aaa bbb="ccc" />
;;!           ^^^^^
;;!          xxxxxx
;;!       ---------
(jsx_attribute
  (_) @value.leading.endOf
  (_) @value
) @value.domain

;;!! <aaa />
;;!   ^^^^
(jsx_self_closing_element
  "<" @G_attribute_collectionKey_value.iteration.start.endOf
  "/>" @G_attribute_collectionKey_value.iteration.end.startOf
)

;;!! <aaa></aaa>
;;!   ^^^
(jsx_opening_element
  "<" @G_attribute_collectionKey_value.iteration.start.endOf
  ">" @G_attribute_collectionKey_value.iteration.end.startOf
)

;;!! <div>text</div>
;;!       ^^^^
;;!! <div>({})</div>
;;!       ^^^^
(
  (jsx_element) @textFragment
  (#child-range! @textFragment 0 -1 true true)
)
