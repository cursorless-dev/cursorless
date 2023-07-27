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
] @statement

(
  [
    (declarations)
    (matches)
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

;;!! not mode: command
;;!  ^^^^^^^^^^^^^^^^^
;;!! slap: key(enter)
;;!  ------^^^^^^^^^^
(
  [
    (matches)
    (declarations)
    (block)
  ] @collectionKey.iteration @name.iteration @value.iteration
  (#not-empty? @collectionKey.iteration)
  (#not-empty? @name.iteration)
  (#not-empty? @value.iteration)
)

;;!! mode: command
;;!  ^^^^^^^^^^^^^
(matches
  (match) @condition
) @_.iteration

;;!! slap: key(enter)
;;!  ^^^^^^^^^^^^^^^^
(declarations
  (command_declaration
    right: (_) @_.interior
  ) @command
) @_.iteration

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

;;!! foo: "bar"
;;!       ^^^^^
(block) @functionCall.iteration @functionCallee.iteration

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
    (_) @argumentOrParameter
  )
)

;;!! key(enter)
;;!      ^^^^^
arguments: (_) @argumentOrParameter.iteration
