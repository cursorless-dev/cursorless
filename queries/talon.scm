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
;;!  ----^^^^---------
;;!! slap: key(enter)
;;!  ^^^^------------
;;!! tag(): user.cursorless
;;!  ^^^^^-----------------
(
  (_
    left: _ @name
  ) @_.domain
  (#not-type? @_.domain "binary_operator")
)

;;!! not mode: command
;;!  ^^^^^^^^---------
;;!! slap: key(enter)
;;!  ^^^^------------
;;!! tag(): user.cursorless
;;!  ^^^^^-----------------
(
  (_
    modifiers: (_)? @collectionKey.start
    left: _ @collectionKey.end
  ) @_.domain
  (#not-type? @_.domain "binary_operator")
)

;;!! not mode: command
;;!  ----------^^^^^^^
;;!! slap: key(enter)
;;!  ------^^^^^^^^^^
(
  (_
    right: (_) @value
  ) @_.domain
  (#not-type? @_.domain "binary_operator")
)

;;!!   mode: command
;;!   <*************
;;!!   tag: user.foo
;;!    *************>
;;!!   -
;;!!   settings():
;;!!       speech.debug = 1
;;!       <****************
;;!!       user.foo = "bar"
;;!        ****************>
;;!!
;;!!   hello: "world"
;;!1  <**************
;;!!   foo:
;;!1   ****
;;!!       bar = 5
;;!1       *******>
;;!2      <*******>
(_
  (_
    right: (_)
  )
) @name.iteration @collectionKey.iteration @value.iteration

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
  (command_declaration
    right: (_) @interior
  ) @command @interior.domain
  (#insertion-delimiter! @command "\n")
)

(
  (source_file) @command.iteration @statement.iteration
  (#document-range! @command.iteration @statement.iteration)
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
  (#child-range! @argumentList 1 -2)
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! # foo
;;!  ^^^^^
(comment) @comment @textFragment

;;!! "foo"
;;!  ^^^^^
(string
  (string_content) @textFragment
) @string
