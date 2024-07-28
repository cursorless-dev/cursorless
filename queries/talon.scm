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

[
  (matches)
  (declarations)
  (block)
] @statement.iteration

;;!! not mode: command
;;!  ----^^^^---------
;;!! slap: key(enter)
;;!  ^^^^------------
;;!! tag(): user.cursorless
;;!  ^^^^^-----------------
(_
  left: _ @name
) @_.domain

;;!! not mode: command
;;!  ^^^^^^^^---------
;;!! slap: key(enter)
;;!  ^^^^------------
;;!! tag(): user.cursorless
;;!  ^^^^^-----------------
(_
  modifiers: (_)? @collectionKey.start
  left: _ @collectionKey.end
) @_.domain

;;!! not mode: command
;;!  ----------^^^^^^^
;;!! slap: key(enter)
;;!  ------^^^^^^^^^^
(_
  right: (_) @value
) @_.domain

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
    right: (_) @_.interior
  ) @command
  (#insertion-delimiter! @command "\n")
)

(source_file
  (declarations) @command.iteration
) @command.iteration.domain

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
  arguments: (_) @argumentOrParameter
)
(sleep_action
  arguments: (_) @argumentOrParameter
)

;;!! print("hello", "world")
;;!        ^^^^^^^  ^^^^^^^
(action
  arguments: (_
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  )
  (#insertion-delimiter! @argumentOrParameter ", ")
)

;;!! key(enter)
;;!      ^^^^^
arguments: (_) @argumentOrParameter.iteration

;;!! # foo
;;!  ^^^^^
(comment) @comment
