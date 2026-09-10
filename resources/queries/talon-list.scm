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
) @_.domain

;;!! # foo
;;!  ^^^^^
(comment) @comment @textFragment

;;!! "foo"
;;!  ^^^^^
(string
  (string_content) @textFragment
) @string

(
  (source_file) @statementNameValue.iteration @collectionKey.iteration
  (#document-range! @statementNameValue.iteration @collectionKey.iteration)
)
