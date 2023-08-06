;;!! foo: "bar"
;;!  ^^^^^^^^^^
;;!! edit.left()
;;!  ^^^^^^^^^^^
;;!! value = 5
;;!  ^^^^^^^^^
;;!!  settings()
;;!  {^^^^^^^^^^
;;!!      speech.debug = 1
;;!       ^^^^^^^^^^^^^^^^}
;;!! tag(): user.some_tag
;;!  ^^^^^^^^^^^^^^^^^^^^
;;!! key(enter): "enter"
;;!  ^^^^^^^^^^^^^^^^^^^
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

(
  [
    (matches)
    (declarations)
    (block)
  ] @statement.iteration
  (#not-empty? @statement.iteration)
)

;;!! not mode: command
;;!  ----^^^^---------
;;!! slap: key(enter)
;;!  ^^^^------------
;;!! tag(): user.cursorless
;;!  ^^^^^-----------------
(_
  (_
    left: _ @name
  ) @_.domain
) @_.iteration

;;!! not mode: command
;;!  ^^^^^^^^---------
;;!! slap: key(enter)
;;!  ^^^^------------
;;!! tag(): user.cursorless
;;!  ^^^^^-----------------
(_
  (_
    modifiers: (_)? @collectionKey.start
    left: _ @collectionKey.end
  ) @_.domain
) @_.iteration

;;!! not mode: command
;;!  ----------^^^^^^^
;;!! slap: key(enter)
;;!  ------^^^^^^^^^^
(_
  (_
    right: (_) @value
  ) @_.domain
) @_.iteration

;;!! mode: command
;;!  ^^^^^^^^^^^^^
(match) @condition

(matches) @condition.iteration

;;!! slap: key(enter)
;;!  ^^^^^^^^^^^^^^^^
(command_declaration
  right: (_) @_.interior
) @command

(declarations) @command.iteration

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
    (_)? @_.leading.start.endOf
    .
    (_) @argumentOrParameter @_.leading.end.startOf @_.trailing.start.endOf
    .
    (_)? @_.trailing.end.startOf
  )
  (#insertion-delimiter! @argumentOrParameter ", ")
)

;;!! key(enter)
;;!      ^^^^^
arguments: (_) @argumentOrParameter.iteration

;;!! # foo
;;!  ^^^^^
(comment) @comment
