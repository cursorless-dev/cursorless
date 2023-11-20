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
) @_.domain

;;!! <aaa value=2>
;;!             ^
(attribute
    (attribute_name) @value.removal.start.endOf
    (attribute_value) @value @value.removal.end.endOf
    (#not-parent-type? @value quoted_attribute_value)
) @_.domain

;;!! <aaa id="me">
;;!          ^^^^
(attribute
    (attribute_name) @value.removal.start.endOf
    (quoted_attribute_value) @string @value @value.removal.end.endOf
    (#not-parent-type? @value quoted_attribute_value)
) @value.domain

;;!! <aaa id="me">
;;!           ^^
(quoted_attribute_value
    (attribute_value) @textFragment
)

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
    (start_tag) @xmlElement.interior.start.endOf
    (end_tag) @xmlElement.interior.end.startOf
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
