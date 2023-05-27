(
  (jsx_fragment) @xmlElement @_.interior @_.iterationScope
  (#child-range! @_.interior 1 -3 true true)
  (#child-range! @_.iterationScope 1 -3 true true)
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
