;; https://github.com/tree-sitter-grammars/tree-sitter-xml/blob/master/xml/src/grammar.json

;;!! <aaa>
;;!   ^^^
;;!  -----
(STag
  (Name) @name
) @name.domain

;;!! </aaa>
;;!    ^^^
;;!  ------
(ETag
  (Name) @name
) @name.domain

;;!! <aaa id="me">
;;!       ^^^^^^^
(Attribute) @attribute

;;!! <aaa id="me">
;;!       ^^ ^^^^
(Attribute
  (Name) @collectionKey @value.leading.endOf
  (AttValue) @value @collectionKey.trailing.startOf
) @_.domain

;;!! <aaa>
;;!  ^^^^^
(STag) @attribute.iteration @collectionKey.iteration @value.iteration

;;!! <!-- comment -->
;;!  ^^^^^^^^^^^^^^^^
(Comment) @comment @textFragment

;;!! <aaa id="me">
;;!          ^^^^
(AttValue
  .
  _ @textFragment.start.endOf
  _ @textFragment.end.startOf
  .
) @string

;;!! <aaa>text</aaa>
;;!       ^^^^
(CharData) @textFragment

;;!! <aaa>text</aaa>
;;!  ^^^^^    ^^^^^^
;;!       ^^^^
(element
  (STag) @xmlStartTag @interior.start.endOf
  (ETag) @xmlEndTag @interior.end.startOf
) @xmlStartTag.domain @xmlEndTag.domain

(element
  [
    (STag)
    (ETag)
  ] @xmlBothTags
  (#allow-multiple! @xmlBothTags)
) @xmlBothTags.domain

;;!! <aaa>text</aaa>
;;!! <aaa/>
(element) @xmlElement

(element
  (STag) @G_xmlElement_xmlBothTags.iteration.start.endOf
  (content
    (element)
  )
  (ETag) @G_xmlElement_xmlBothTags.iteration.end.startOf
)

(_
  (STag) @G_xmlStartTag_xmlEndTag.iteration.start.endOf
  (content
    (element)
  )
  (ETag) @G_xmlStartTag_xmlEndTag.iteration.end.startOf
)
