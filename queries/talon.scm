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
  (expression_statement)
  (assignment_statement)
  (settings_declaration)
  (tag_import_declaration)
  (key_binding_declaration)
  (match)
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
    right: (_) @command.interior
  ) @command @statement
) @command.iteration

;;!! key(enter)
;;!  ^^^^^^^^^^
;;!! edit.left()
;;!  ^^^^^^^^^^^
(block
  (_
    [
      (key_action)
      (sleep_action)
      (action)
    ] @functionCall
  )
) @_.iteration

;;!! edit.left()
;;!  ^^^^^^^^^--
(block
  (_
    (action
      action_name: (_) @functionCallee
    ) @_.domain
  )
) @_.iteration

;;!! key(enter)
;;!  ^^^-------
(block
  (_
    [
      (key_action)
      (sleep_action)
    ] @functionCallee @_.domain
    (#shrink-to-match! @functionCallee "\\w+")
  )
) @_.iteration

;;!! key(enter)
;;!      ^^^^^
(key_action
  arguments: (_) @argumentOrParameter @_.iteration
)
(sleep_action
  arguments: (_) @argumentOrParameter @_.iteration
)

;;!! print("hello", "world")
;;!        ^^^^^^^  ^^^^^^^
(action
  arguments: (_
    (_) @argumentOrParameter
  ) @_.iteration
)
