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
  (if_statement)
  (for_statement)
] @statement

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
  ) @collectionKey.domain
  (#not-type? @collectionKey.domain binary_operator assignment_statement)
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
  (_) @G_name_collectionKey_value.iteration.end.endOf
  .
) @G_name_collectionKey_value.iteration.start.startOf

;;!! hello: "world"
;;!  ^^^^^^^^^^^^^^
(declarations) @G_name_collectionKey_value.iteration

;;!! hello: "world"
;;!         ^^^^^^^
;;!! settings():
;;!!     speech.debug = 1
;;!      ^^^^^^^^^^^^^^^^
(block) @G_statement_name_value_collectionKey.iteration

(
  (source_file) @G_command_statement_name_value_collectionKey.iteration
  (#document-range! @G_command_statement_name_value_collectionKey.iteration)
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
    "-" @condition.trailing
  ) @condition.start.startOf
) @condition.domain

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
) @functionCallee.domain

;;!! key(enter)
;;!  ^^^-------
(
  [
    (key_action)
    (sleep_action)
  ] @functionCallee @functionCallee.domain
  ;; There is no node just for the function callee, so we have to shrink the function call to just the callee
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
    (_)? @argumentOrParameter.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @argumentOrParameter.trailing.startOf
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

;;!! if true: print("true")
;;!  ^^^^^^^^^^^^^^^^^^^^^^
;;!           ^^^^^^^^^^^^^
;;!     ^^^^
(if_statement
  condition: (_) @condition
  body: (_) @interior
) @ifStatement @condition.domain

;;!! for v in values: print(v)
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^^
;;!      ^
;;!           ^^^^^^
;;!                   ^^^^^^^^
(for_statement
  name: (_) @name
  value: (_) @value
  body: (_) @interior
) @name.domain @value.domain
