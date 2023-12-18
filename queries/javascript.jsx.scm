;;!! <foo>bar</foo>
;;!  ^^^^^^^^^^^^^^
;;!       ###
;;!       ***
(
  (jsx_element) @xmlElement @_.interior @_.iteration
  (#child-range! @_.interior 0 -1 true true)
  (#child-range! @_.iteration 0 -1 true true)
)

;;!! <foo>bar</foo>
;;!       ***
(
  (jsx_element) @xmlStartTag.iteration @xmlEndTag.iteration @xmlBothTags.iteration
  (#child-range! @xmlStartTag.iteration 0 -1 true true)
  (#child-range! @xmlEndTag.iteration 0 -1 true true)
  (#child-range! @xmlBothTags.iteration 0 -1 true true)
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

;;!! <foo/>
(jsx_self_closing_element) @xmlElement

;; ======== JSX fragments, eg <>foo</>  ==========

;;!! <>foo</>
;;!  ^^^^^^^^
;;!    ###
;;!    ***
(
  (jsx_fragment) @xmlElement @_.interior @_.iteration
  (#child-range! @_.interior 1 -3 true true)
  (#child-range! @_.iteration 1 -3 true true)
)

;;!! <>foo</>
;;!    ***
(
  (jsx_fragment) @xmlStartTag.iteration @xmlEndTag.iteration @xmlBothTags.iteration
  (#child-range! @xmlStartTag.iteration 1 -3 true true)
  (#child-range! @xmlEndTag.iteration 1 -3 true true)
  (#child-range! @xmlBothTags.iteration 1 -3 true true)
)

;;!! <>foo</>
;;!  ^^------
(
  (jsx_fragment) @xmlStartTag @xmlBothTags @_.domain
  (#child-range! @xmlStartTag 0 1)
  (#child-range! @xmlBothTags 0 1)
  (#allow-multiple! @xmlBothTags)
)

;;!! <>foo</>
;;!  -----^^^
(
  (jsx_fragment) @xmlEndTag @xmlBothTags @_.domain
  (#child-range! @xmlEndTag -3)
  (#child-range! @xmlBothTags -3)
  (#allow-multiple! @xmlBothTags)
)

;; Sets `name` to be empty range inside the fragment tag:
;;!! <>foo</>
;;!  {}    {}
;;!  --   ---
(jsx_fragment
  "<" @_.domain.start
  ">" @name.startOf @_.domain.end
)

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
  "/" @attribute.iteration.end.startOf @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)

;;!! <aaa></aaa>
;;!   ^^^
(jsx_opening_element
  "<" @attribute.iteration.start.endOf @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  ">" @attribute.iteration.end.startOf @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)

;;!! <div>text</div>
;;!       ^^^^
(jsx_text) @textFragment
