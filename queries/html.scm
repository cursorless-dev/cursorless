;; https://github.com/tree-sitter/tree-sitter-html/blob/master/src/grammar.json

;;!! <aaa>
;;!   ^^^
;;!  -----
(start_tag
  (tag_name) @name
) @_.domain

;;!! </aaa>
;;!    ^^^
;;!  ------
(end_tag
  (tag_name) @name
) @_.domain

;;!! <aaa id="me">
;;!       ^^^^^^^
(attribute) @attribute

;;!! <aaa id="me">
;;!       ^^
(attribute
  (attribute_name) @collectionKey
  [
    (quoted_attribute_value)
    (attribute_value)
  ] ? @collectionKey.trailing.startOf
) @_.domain

;;!! <aaa value=2>
;;!             ^
;;!! <aaa id="me">
;;!          ^^^^
(attribute
  (attribute_name) @value.leading.endOf
  [
    (quoted_attribute_value)
    (attribute_value)
  ] @value
) @value.domain

;;!! <aaa id="me">
;;!           ^^
(quoted_attribute_value
  (attribute_value) @textFragment
) @string

;;!! <aaa>
;;!  ^^^^^
(start_tag) @attribute.iteration @collectionKey.iteration @value.iteration

;;!! <!-- comment -->
;;!  ^^^^^^^^^^^^^^^^
(comment) @comment @textFragment

;;!! <aaa>text</aaa>
;;!       ^^^^
(text) @textFragment

;;!! <script>hello</script>
;;!          ^^^^^
(raw_text) @textFragment

;; Use parent wildcard to get all three kinds of elements: element, script_element, style_element

;;!! <aaa>text</aaa>
;;!  ^^^^^^^^^^^^^^^
;;!       ^^^^
(_
  (start_tag) @interior.start.endOf
  (end_tag) @interior.end.startOf
) @xmlElement

;;!! <aaa>text</aaa>
;;!  ^^^^^    ^^^^^^
;;!  ---------------
(_
  (start_tag) @xmlStartTag
  (end_tag) @xmlEndTag
) @_.domain

(_
  [
    (start_tag)
    (end_tag)
  ] @xmlBothTags
  (#allow-multiple! @xmlBothTags)
) @_.domain

(_
  (start_tag) @xmlElement.iteration.start.endOf @xmlBothTags.iteration.start.endOf
  (element)
  (end_tag) @xmlElement.iteration.end.startOf @xmlBothTags.iteration.end.startOf
)

(_
  (start_tag) @xmlStartTag.iteration.start.endOf @xmlEndTag.iteration.start.endOf
  (element)
  (end_tag) @xmlStartTag.iteration.end.startOf @xmlEndTag.iteration.end.startOf
)
