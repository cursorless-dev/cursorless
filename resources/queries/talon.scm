;; https://github.com/pokey/tree-sitter-talon/blob/dev/src/grammar.json

;;!!  foo: "bar"
;;!   ^^^^^^^^^^
;;!!  edit.left()
;;!   ^^^^^^^^^^^
;;!!  value = 5
;;!   ^^^^^^^^^
;;!!  settings()
;;!  {^^^^^^^^^^
;;!!      speech.debug = 1
;;!       ^^^^^^^^^^^^^^^^}
;;!!  tag(): user.some_tag
;;!   ^^^^^^^^^^^^^^^^^^^^
;;!!  key(enter): "enter"
;;!   ^^^^^^^^^^^^^^^^^^^
[
  (match)
  (command_declaration)
  (settings_declaration)
  (expression_statement)
  (assignment_statement)
  (tag_import_declaration)
  (key_binding_declaration)
  (face_declaration)
  (gamepad_declaration)
  (parrot_declaration)
] @statement

(block) @statement.iteration

;;!! not mode: command
;;!      ^^^^
;;!            ^^^^^^^
;;!! slap: key(enter)
;;!  ^^^^
;;!        ^^^^^^^^^^
;;!! tag(): user.cursorless
;;!  ^^^^^
;;!         ^^^^^^^^^^^^^^^
(
  (_
    left: _ @name @value.leading.endOf
    right: (_) @value
  ) @_.domain
  (#not-type? @_.domain binary_operator assignment_statement)
)

;;!! not mode: command
;;!  ^^^^^^^^
;;!! slap: key(enter)
;;!  ^^^^
;;!! tag(): user.cursorless
;;!  ^^^^^
(
  (_
    modifiers: (_)? @collectionKey.start
    left: _ @collectionKey.end
    right: (_) @collectionKey.trailing.startOf
  ) @_.domain
  (#not-type? @_.domain binary_operator assignment_statement)
)

;;!! foo = 0
;;!  ^^^
;;!        ^
(assignment_statement
  left: (_) @name @value.leading.endOf
  right: (_) @value @name.trailing.startOf
) @_.domain

;;!! mode: command
;;!  ^^^^^^^^^^^^^
(matches
  (_) @name.iteration.end.endOf @collectionKey.iteration.end.endOf @value.iteration.end.endOf
  .
) @name.iteration.start.startOf @collectionKey.iteration.start.startOf @value.iteration.start.startOf

;;!! hello: "world"
;;!  ^^^^^^^^^^^^^^
(declarations) @name.iteration @collectionKey.iteration @value.iteration

;;!! hello: "world"
;;!         ^^^^^^^
;;!! settings():
;;!!     speech.debug = 1
;;!      ^^^^^^^^^^^^^^^^
(block) @name.iteration @collectionKey.iteration @value.iteration

(
  (source_file) @command.iteration @statement.iteration
  (#document-range! @command.iteration @statement.iteration)
)

(
  (source_file) @name.iteration @collectionKey.iteration @value.iteration
  (#document-range! @name.iteration @collectionKey.iteration @value.iteration)
)

;;!!  tag: user.foo
;;!  {^^^^^^^^^^^^^
;;!  (xxxxxxxxxxxxx
;;!  [-------------
;;!!  app: bar
;;!   ^^^^^^^^}
;;!   xxxxxxxx
;;!   --------
;;!!  -
;;!   x)
;;!   -
;;!!  bongo: bazman
;;!   -------------
;;!!  foo: key(a)
;;!   -----------]
(source_file
  (matches
    (_) @condition.end.endOf
    .
    "-" @_.trailing
  ) @condition.start.startOf
) @_.domain

;;!! slap: key(enter)
;;!  ^^^^^^^^^^^^^^^^
(
  (command_declaration) @command
  (#insertion-delimiter! @command "\n")
)

;;!! slap: key(enter)
;;!       ^^^^^^^^^^^
(
  (command_declaration
    ":" @interior.start.endOf
    right: (_) @interior.end.endOf
  )
)

;;!! key(enter)
;;!  ^^^^^^^^^^
;;!! edit.left()
;;!  ^^^^^^^^^^^
[
  (key_action)
  (sleep_action)
  (action)
] @functionCall

;;!! edit.left()
;;!  ^^^^^^^^^--
(action
  action_name: (_) @functionCallee
) @_.domain

;;!! key(enter)
;;!  ^^^-------
(
  [
    (key_action)
    (sleep_action)
  ] @functionCallee @_.domain
  (#shrink-to-match! @functionCallee "\\w+")
)

;;!! key(enter)
;;!      ^^^^^
(key_action
  (implicit_string) @argumentOrParameter @argumentOrParameter.iteration @argumentList
) @argumentOrParameter.iteration.domain @argumentList.domain

;;!! sleep(100ms)
;;!        ^^^^^
(sleep_action
  (implicit_string) @argumentOrParameter @argumentOrParameter.iteration @argumentList
) @argumentOrParameter.iteration.domain @argumentList.domain

;;!! print("hello", "world")
;;!        ^^^^^^^  ^^^^^^^
(action
  arguments: (argument_list
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  )
  (#insertion-delimiter! @argumentOrParameter ", ")
)

(_
  (argument_list
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! # foo
;;!  ^^^^^
(comment) @comment @textFragment

;;!! "foo"
;;!  ^^^^^
(string
  (string_content) @textFragment
) @string
