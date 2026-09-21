;;!! app: vscode
;;!  ^^^^^^^^^^^
;;!!  foo: "bar"
;;!   ^^^^^^^^^^
[
  (match)
  (command_declaration)
] @statement

;;!! not mode: command
;;!      ^^^^
;;!            ^^^^^^^
;;!!  foo: "bar"
;;!   ^^^
;;!        ^^^^^
(_
  left: _ @name @value.leading.endOf
  right: (_) @value @name.removal.end.startOf
) @_.domain @name.removal.start.startOf

;;!! not mode: command
;;!  ^^^^^^^^
;;!!  foo: "bar"
;;!   ^^^
(_
  modifiers: (_)? @collectionKey.start
  left: _ @collectionKey.end
  right: (_) @collectionKey.trailing.startOf
) @collectionKey.domain

;;!! # foo
;;!  ^^^^^
(comment) @comment @textFragment

;;!! "foo"
;;!  ^^^^^
(string
  (string_content) @textFragment
) @string

(
  (source_file) @G_statement_name_value_collectionKey.iteration
  (#document-range! @G_statement_name_value_collectionKey.iteration)
)
