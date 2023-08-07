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

  ;; The Talon Tree sitter can contain an empty matches node if there is no
  ;; header. When this happens and the user has an empty cursor at the start of
  ;; the document we get an empty range for the iteration scope for
  ;; key/value/name/statement.
  (#not-empty? @statement.iteration)
)

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

(_
  (_
    right: (_)
  )
) @name.iteration @collectionKey.iteration @value.iteration

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
