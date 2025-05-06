;; https://github.com/tree-sitter/tree-sitter-css/blob/master/src/grammar.json

[
  (at_rule)
  (charset_statement)
  (import_statement)
  (keyframes_statement)
  (media_statement)
  (namespace_statement)
  (rule_set)
  (supports_statement)
] @statement

;;!! "hello"
;;!   ^^^^^
(
  (string_value) @string @textFragment
  (#character-range! @textFragment 1 -1)
)

;;!! /* Hello */
;;!  ^^^^^^^^^^^
(comment) @comment @textFragment

;;!! calc(100% - 50px);
;;!  ^^^^^^^^^^^^^^^^^
(call_expression
  (function_name) @functionCallee
) @functionCall @functionCallee.domain

;;!! div {}
;;!  ^^^
(rule_set
  (selectors) @selector
) @_.domain

;;!! width: 100px;
(declaration
  (property_name) @name @collectionKey
  .
  (_) @value.start
  (_)? @value.end
  .
) @collectionItem @_.domain

;;!! a[target="_blank"]
;;!    ^^^^^^
(attribute_selector
  (attribute_name) @name
  (string_value) @value
) @_.domain

;;!! @import "subs.css"
;;!          ^^^^^^^^^^
(import_statement
  (_) @value
) @_.domain

;;!! translate(-50%, -50%)
;;!            ^^^^  ^^^^
(
  (arguments
    (_)? @_.leading.endOf
    .
    [
      "("
      ","
      (
        (plain_value) @_dummy
        (#eq? @_dummy "at")
      )
    ]
    .
    (_) @argumentOrParameter
    (
      [
        ","
        (
          (plain_value) @_dummy
          (#eq? @_dummy "at")
        )
      ]
      .
      (_) @_.trailing.startOf
    )?
  )
  (#grow-to-named-siblings! @argumentOrParameter "at")
  (#insertion-delimiter! @argumentOrParameter ", ")
)

(arguments
  .
  "(" @argumentOrParameter.iteration.start.endOf
  ")" @argumentOrParameter.iteration.end.startOf
  .
) @argumentOrParameter.iteration.domain

;; Entire file
(
  (stylesheet) @name.iteration @collectionKey.iteration @value.iteration
  (#document-range! @name.iteration @collectionKey.iteration @value.iteration)
)
(
  (stylesheet) @statement.iteration
  (#document-range! @statement.iteration)
)

;; { }
(block
  .
  "{" @name.iteration.start.endOf @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "}" @name.iteration.end.startOf @collectionKey.iteration.end.startOf @value.iteration.end.startOf
  .
) @map

;;!! width: 100px;
;;!            ^^
(declaration
  (integer_value
    (unit) @unit
  )
  (#allow-multiple! @unit)
) @_.domain

(integer_value
  (unit) @unit
) @_.domain

;;!! @namespace prefix "XML-namespace-URL";
;;!             ^^^^^^^^^^^^^^^^^^^^^^^^^^
(namespace_statement
  (namespace_name) @value.start
  (string_value) @value.end
) @_.domain

;;!! @namespace url(http://www.w3.org/1999/xhtml);
;;!             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(namespace_statement
  (call_expression) @value
) @_.domain

;;!! div > a
;;!      ^
(child_selector
  ">" @disqualifyDelimiter
)
