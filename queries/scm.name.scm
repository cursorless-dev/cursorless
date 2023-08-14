;; Include everything leading up to the first capture in the domain for name
(
  (_
    _ @dummy
    .
    (capture
      "@" @_.leading
      name: (identifier) @name.start
    )
    (capture)? @name.end
    .
  ) @_.domain
  (#not-type? @_.domain parameters)
  (#not-type? @dummy capture)
  (#not-parent-type? @_.domain field_definition)
  (#insertion-delimiter! @name.start " @")
)

;; Include everything leading up to the first capture in the domain for name
(
  (field_definition
    (_
      _ @dummy
      .
      (capture
        "@" @_.leading
        name: (identifier) @name.start
      )
      (capture)? @name.end
      .
    )
  ) @_.domain
  (#not-type? @dummy capture)
  (#insertion-delimiter! @name.start " @")
)

;; Only include the capture itself in its domain after the first capture
(
  (_
    (capture
      "@" @_.leading
      name: (identifier) @name
    ) @_.domain
  ) @dummy
  (#not-type? @dummy parameters)
  (#has-n-children-of-type? @dummy capture 2 -1)
  (#insertion-delimiter! @name " @")
)

(
  (_
    _ @dummy
    .
    (capture) @name.iteration.start
  ) @name.iteration.end.endOf @name.iteration.domain
  (#not-type? @dummy capture)
  (#not-type? @name.iteration.start parameters)
  (#not-parent-type? @name.iteration.domain field_definition)
)

(
  (field_definition
    [
      ;; Note that we can't use wildcard node due to
      ;; https://github.com/tree-sitter/tree-sitter/issues/2483
      (named_node
        _ @dummy
        .
        (capture) @name.iteration.start
      )
      (anonymous_node
        _ @dummy
        .
        (capture) @name.iteration.start
      )
      (list
        _ @dummy
        .
        (capture) @name.iteration.start
      )
    ]
  ) @name.iteration.end.endOf @name.iteration.domain
  (#not-type? @dummy capture)
)
