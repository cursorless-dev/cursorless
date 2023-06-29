(_
  [
    (expression_statement)
    (assignment_statement)
  ] @statement
) @_.iteration

;;!! not mode: command
;;!  ----^^^^---------
;;!! slap: key("end enter")
;;!  ^^^^------------------
(_
  (_
    left: (_) @name
  ) @_.domain
) @_.iteration

;;!! not mode: command
;;!  ^^^^^^^^---------
;;!! slap: key("end enter")
;;!  ^^^^------------------
(_
  (_
    modifiers: (_)? @collectionKey.start
    left: (_) @collectionKey.end
  ) @_.domain
) @_.iteration

;;!! not mode: command
;;!  ---------x^^^^^^^
;;!! slap: key("end enter")
;;!  -----x^^^^^^^^^^^^^^^^
(_
  (_
    right: (_) @value
  ) @_.domain
) @_.iteration

;;!! slap: key("end enter")
;;!  ^^^^^^^^^^^^^^^^^^^^^^
;;!        ################
(_
  (command_declaration
    right: (_) @_.interior
  ) @statement
) @_.iteration

;;!! settings()
;;!!     speech.debug = 1
;;!  ^^^^^^^^^^^^^^^^^^^^
;;!      ################
(_
  (settings_declaration
    right: (_) @_.interior
  ) @statement
) @_.iteration

;; functionCall
;; functionCallee
;;action_name

;;!! key(enter)
;;!  ^^^^^^^^^^
;;!! edit.left()
;;!  ^^^^^^^^^^^
(block
  (_
    [
      (key_action)
      (action)
    ] @functionCall
  )
) @_.iteration

;;!! key(enter)
;;!      ^^^^^
(key_action
  arguments: (_) @argumentOrParameter @_.iteration
)

;;!! print("hello", "world")
;;!        ^^^^^^^  ^^^^^^^
(action
  arguments: (_
    (_) @argumentOrParameter
  ) @_.iteration
)

;;!! key(enter)
;;!  ^^^-------
;;!! edit.left()
;;!  ^^^^^^^^^--
(block
  (_
    (action
      action_name: (_) @name @functionCallee
    ) @_.domain
  )
) @_.iteration

;;!! mode: command
;;!  ^^^^^^^^^^^^^
(_
  (match) @condition
) @_.iteration
