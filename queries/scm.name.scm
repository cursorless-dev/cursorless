;; Include everything leading up to the first capture in the domain for name
(
  (_
    (capture
      "@" @_.leading
      name: (identifier) @name
    )
  ) @_.domain
  (#not-type? @_.domain parameters)
  (#not-parent-type? @_.domain field_definition)
  (#allow-multiple! @name)
  (#insertion-delimiter! @name " @")
)

;; Include everything leading up to the first capture in the domain for name
(
  (field_definition
    (_
      (capture
        "@" @_.leading
        name: (identifier) @name
      )
    )
  ) @_.domain
  (#allow-multiple! @name)
  (#insertion-delimiter! @name " @")
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
    (capture)
  ) @name.iteration
  (#not-type? @name.iteration parameters)
  (#not-parent-type? @name.iteration field_definition)
)

(field_definition
  [
    ;; Note that we can't use wildcard node due to
    ;; https://github.com/tree-sitter/tree-sitter/issues/2483
    (named_node
      (capture)
    )
    (anonymous_node
      (capture)
    )
    (list
      (capture)
    )
  ]
) @name.iteration
