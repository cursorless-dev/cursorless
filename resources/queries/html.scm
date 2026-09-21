;; https://github.com/tree-sitter/tree-sitter-html/blob/master/src/grammar.json

;;!! <aaa>
;;!   ^^^
;;!  -----
(start_tag
  (tag_name) @name
) @name.domain

;;!! </aaa>
;;!    ^^^
;;!  ------
(end_tag
  (tag_name) @name
) @name.domain

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
) @collectionKey.domain

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

;;!! <aaa>text</aaa>
;;!  ^^^^^^^^^^^^^^^
;;!  ^^^^^    ^^^^^^
;;!       ^^^^
(_
  (start_tag) @xmlStartTag @interior.start.endOf
  (end_tag) @xmlEndTag @interior.end.startOf
) @xmlElement @xmlStartTag.domain @xmlEndTag.domain

(_
  [
    (start_tag)
    (end_tag)
  ] @xmlBothTags
  (#allow-multiple! @xmlBothTags)
) @xmlBothTags.domain

(_
  (start_tag) @G_xmlElement_xmlBothTags_xmlStartTag_xmlEndTag.iteration.start.endOf
  (element)
  (end_tag) @G_xmlElement_xmlBothTags_xmlStartTag_xmlEndTag.iteration.end.startOf
)
