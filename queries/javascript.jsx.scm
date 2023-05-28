(
  (jsx_element) @xmlElement @_.interior @_.iteration
  (#child-range! @_.interior 0 -1 true true)
  (#child-range! @_.iteration 0 -1 true true)
)

(
  (jsx_element) @xmlStartTag.iteration @xmlEndTag.iteration @xmlBothTags.iteration
  (#child-range! @xmlStartTag.iteration 0 -1 true true)
  (#child-range! @xmlEndTag.iteration 0 -1 true true)
  (#child-range! @xmlBothTags.iteration 0 -1 true true)
)

(jsx_element
  (jsx_opening_element) @xmlStartTag @xmlBothTags
  (#allow-multiple! @xmlBothTags)
) @_.domain

(jsx_element
  (jsx_closing_element) @xmlEndTag @xmlBothTags
  (#allow-multiple! @xmlBothTags)
) @_.domain

(jsx_self_closing_element) @xmlElement

;; JSX fragments, eg <>foo</>
(
  (jsx_fragment) @xmlElement @_.interior @_.iteration
  (#child-range! @_.interior 1 -3 true true)
  (#child-range! @_.iteration 1 -3 true true)
)

(
  (jsx_fragment) @xmlStartTag.iteration @xmlEndTag.iteration @xmlBothTags.iteration
  (#child-range! @xmlStartTag.iteration 1 -3 true true)
  (#child-range! @xmlEndTag.iteration 1 -3 true true)
  (#child-range! @xmlBothTags.iteration 1 -3 true true)
)

(
  (jsx_fragment) @xmlStartTag @xmlBothTags @_.domain
  (#child-range! @xmlStartTag 0 1)
  (#child-range! @xmlBothTags 0 1)
  (#allow-multiple! @xmlBothTags)
)

(
  (jsx_fragment) @xmlEndTag @xmlBothTags @_.domain
  (#child-range! @xmlEndTag -3)
  (#child-range! @xmlBothTags -3)
  (#allow-multiple! @xmlBothTags)
)

(
  (jsx_fragment
    "<" @_.domain.start
    ">" @name @_.domain.end
  )
  (#start! @name)
)

