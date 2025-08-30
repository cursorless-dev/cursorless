;;!! app: vscode
;;!  ^^^^^^^^^^^
;;!!  foo: "bar"
;;!   ^^^^^^^^^^
[
  (match)
  (command_declaration)
] @statement

;;!! not app: vscode
;;!      ^^^
;;!!  foo: "bar"
;;!   ^^^
(_
  left: _ @name
) @_.domain

;;!! not app: vscode
;;!  ^^^^^^^
;;!!  foo: "bar"
;;!   ^^^^^^^^^^
(_
  modifiers: (_)? @collectionKey.start
  left: _ @collectionKey.end
) @_.domain

;;!! not app: vscode
;;!           ^^^^^^
;;!!  foo: "bar"
;;!        ^^^^^
(
  (_
    right: (_) @value
  ) @_.domain
)

;;!! # foo
;;!  ^^^^^
(comment) @comment @textFragment

;;!! "foo"
;;!  ^^^^^
(string
  (string_content) @textFragment
) @string

(
  (source_file) @statement.iteration
  (#document-range! @statement.iteration)
)

(
  (source_file) @name.iteration @collectionKey.iteration @value.iteration
  (#document-range! @name.iteration @collectionKey.iteration @value.iteration)
)
