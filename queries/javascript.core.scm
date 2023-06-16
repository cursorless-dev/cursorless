;; import javascript.function.scm

(
  (_
      name: (_) @name
  ) @_.domain
  (#not-parent-type? @_.domain export_statement)
  (#not-type?
      @_.domain
      variable_declarator
      method_signature
      abstract_method_signature
      public_field_definition
      field_definition
  )
)
(export_statement
  (_
      name: (_) @name
  ) @dummy
  (#not-type? @dummy variable_declarator)
) @_.domain

(
  [
    (lexical_declaration
      (variable_declarator
          name: (_) @name
      )
    )
    ;; Note that we can't merge this with the variable declaration above because
    ;; of https://github.com/tree-sitter/tree-sitter/issues/1442#issuecomment-1584628651
    (variable_declaration
      (variable_declarator
          name: (_) @name
      )
    )
  ] @_.domain
  (#not-parent-type? @_.domain export_statement)
  (#allow-multiple! @name)
)

(
  (export_statement
    (_
      (variable_declarator
          name: (_) @name
      )
    )
  ) @_.domain
  (#allow-multiple! @name)
)

(augmented_assignment_expression
    left: (_) @name
) @_.domain

(assignment_expression
    left: (_) @name
) @_.domain

[
  (program)
  (formal_parameters)
] @name.iteration

(
  (_
    body: (_
        .
        "{" @name.iteration.start
        "}" @name.iteration.end
        .
    )
  )
  (#end-position! @name.iteration.start)
  (#start-position! @name.iteration.end)
)
