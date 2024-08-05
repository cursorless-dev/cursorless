;; https://github.com/tree-sitter-grammars/tree-sitter-xml/blob/master/xml/src/grammar.json

;;!! <aaa>
;;!   ^^^
;;!  -----
(STag
  (Name) @name
) @_.domain

;;!! </aaa>
;;!    ^^^
;;!  ------
(ETag
  (Name) @name
) @_.domain

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
(AttValue) @string @textFragment

;;!! <aaa>text</aaa>
;;!       ^^^^
(CharData) @textFragment

;;!! <aaa>text</aaa>
;;!  ^^^^^^^^^^^^^^^
;;!       ^^^^
(element
  (STag) @xmlElement.interior.start.endOf
  (ETag) @xmlElement.interior.end.startOf
) @xmlElement

;;!! <aaa>text</aaa>
;;!  ^^^^^    ^^^^^^
;;!  ---------------
(element
  (STag) @xmlStartTag
  (ETag) @xmlEndTag
) @_.domain

(element
  [
    (STag)
    (ETag)
  ] @xmlBothTags
  (#allow-multiple! @xmlBothTags)
) @_.domain

(element
  (STag) @xmlElement.iteration.start.endOf @xmlBothTags.iteration.start.endOf
  (content
    (element)
  )
  (ETag) @xmlElement.iteration.end.startOf @xmlBothTags.iteration.end.startOf
)

(_
  (STag) @xmlStartTag.iteration.start.endOf @xmlEndTag.iteration.start.endOf
  (content
    (element)
  )
  (ETag) @xmlStartTag.iteration.end.startOf @xmlEndTag.iteration.end.startOf
)
