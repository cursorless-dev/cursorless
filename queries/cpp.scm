;; import c.scm

[
  (class_specifier)
  (struct_specifier)
  (enum_specifier)
  (union_specifier)
] @class

(_
  (class_specifier
    name: (_) @className
  ) @_.domain.start
  ";"? @_.domain.end
)

;;  void ClassName::method() {}
(function_definition
  declarator: (_
    declarator: (_
      namespace: (_) @className
    )
  )
) @_.domain
