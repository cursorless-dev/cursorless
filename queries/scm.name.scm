;;!! (aaa) @bbb @ccc
;;!        ^^^^^^^^^
;;!  ---------------
(
  (_
    _ @_dummy
    .
    (capture) @name.start
    (capture)? @name.end
    .
  ) @_.domain
  (#not-type? @_.domain parameters)
  (#not-type? @_dummy capture)
  (#not-parent-type? @_.domain field_definition)
)

;;!! eee: (aaa) @bbb @ccc
;;!             ^^^^^^^^^
;;!  --------------------
(
  (field_definition
    (_
      _ @_dummy
      .
      (capture) @name.start
      (capture)? @name.end
      .
    )
  ) @_.domain
  (#not-type? @_dummy capture)
)

;;!! (aaa) @bbb @ccc
;;!        ^^^^ ^^^^
(
  (_
    (capture) @name
  ) @_dummy
  (#not-type? @_dummy parameters)
  (#has-multiple-children-of-type? @_dummy capture)
)

;;!! (aaa) @bbb @ccc
;;!        *********
;;!  --------------- <~ iteration domain
(
  (_
    _ @_dummy
    .
    (capture) @name.iteration.start
  ) @name.iteration.end.endOf @name.iteration.domain
  (#not-type? @_dummy capture)
  (#not-type? @name.iteration.start parameters)
  (#not-parent-type? @name.iteration.domain field_definition)
)

;;!! ddd: (aaa) @bbb @ccc
;;!             *********
;;!  -------------------- <~ iteration domain
(
  (field_definition
    [
      ;; Note that we can't use wildcard node due to
      ;; https://github.com/tree-sitter/tree-sitter/issues/2483
      (named_node
        _ @_dummy
        .
        (capture) @name.iteration.start
      )
      (anonymous_node
        _ @_dummy
        .
        (capture) @name.iteration.start
      )
      (list
        _ @_dummy
        .
        (capture) @name.iteration.start
      )
    ]
  ) @name.iteration.end.endOf @name.iteration.domain
  (#not-type? @_dummy capture)
)
