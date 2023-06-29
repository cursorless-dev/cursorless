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
(_
  (command_declaration) @statement
) @_.iteration

;;!! settings()
;;!!     speech.debug = 1
;;!  ^^^^^^^^^^^^^^^^^^^^
(_
  (settings_declaration) @statement
) @_.iteration
