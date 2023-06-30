;;!! edit.left()
;;!  ^^^^^^^^^^^
;;!! value = 5
;;!  ^^^^^^^^^
;;!! settings()
;;!!     speech.debug = 1
;;!  ^^^^^^^^^^^^^^^^^^^^
;;!! tag(): user.some_tag
;;!  ^^^^^^^^^^^^^^^^^^^^
;;!! key(enter): "enter"
;;!  ^^^^^^^^^^^^^^^^^^^
(_
  [
    (expression_statement)
    (assignment_statement)
    (settings_declaration)
    (tag_import_declaration)
    (key_binding_declaration)
  ] @statement
) @_.iteration

;;!! not mode: command
;;!  ----^^^^---------
;;!! slap: key("end enter")
;;!  ^^^^------------------
;;!! tag(): user.cursorless
;;!  ^^^^^-----------------
(_
  (_
    left: _ @name
  ) @_.domain
) @_.iteration

;;!! not mode: command
;;!  ^^^^^^^^---------
;;!! slap: key("end enter")
;;!  ^^^^------------------
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
;;!! slap: key("end enter")
;;!  ------^^^^^^^^^^^^^^^^
(_
  (_
    right: (_) @value
  ) @_.domain
) @_.iteration

;;!! mode: command
;;!  ^^^^^^^^^^^^^
(matches
  (match) @condition
) @_.iteration

;;!! slap: key("end enter")
;;!  ^^^^^^^^^^^^^^^^^^^^^^
;;!        ################
(declarations
  (command_declaration
    right: (_) @command.interior
  ) @command @statement
) @_.iteration

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
    (#pattern! @functionCallee "\\w+")
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
