;; import javascript.function.scm

;; `name` scope without `export`
(
  (_
    name: (_) @name
  ) @_.domain
  (#not-parent-type? @_.domain export_statement)

  ;; We have special cases for these defined elsewhere
  (#not-type?
    @_.domain
    variable_declarator
    method_signature
    abstract_method_signature
    public_field_definition
    field_definition
  )
)

;; `name` scope with `export`
(export_statement
  (_
    name: (_) @name
  ) @dummy

  ;; We have a special case for this one.  Note we don't need to list the other
  ;; special cases from above because they can't be exported
  (#not-type? @dummy variable_declarator)
) @_.domain

;; Special cases for `(let | const | var) foo = ...;` because the full statement
;; is actually a grandparent of the `name` node, so we want the domain to include
;; this full grandparent statement.
(
  [
    ;;!! (const | let) foo = ...;
    ;;!  --------------^^^-------
    (lexical_declaration
      .
      (variable_declarator
        name: (_) @name @name.removal.end.endOf @value.leading.start.endOf
        value: (_)? @value @name.removal.end.startOf @value.leading.end.startOf
      )
    )

    ;;!! var foo = ...;
    ;;!  ----^^^-------
    ;; Note that we can't merge this with the variable declaration above because
    ;; of https://github.com/tree-sitter/tree-sitter/issues/1442#issuecomment-1584628651
    (variable_declaration
      .
      (variable_declarator
        name: (_) @name @name.removal.end.endOf @value.leading.start.endOf
        value: (_)? @value @name.removal.end.startOf @value.leading.end.startOf
      )
    )
  ] @_.domain @name.removal.start.startOf
  (#not-parent-type? @_.domain export_statement)

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! (let | const | var) aaa = ..., ccc = ...;
  ;;!  --------------------^^^--------^^^-------
  (#allow-multiple! @name)
  (#allow-multiple! @value)
)

;; Special cases for `(let | const | var) foo = ...;` because the full statement
;; is actually a grandparent of the `name` node, so we want the domain to include
;; this full grandparent statement.
(
  [
    ;;!! (const | let) foo = ...;
    ;;!  --------------^^^-------
    (lexical_declaration
      (variable_declarator)
      .
      (variable_declarator
        name: (_) @name @name.trailing.start.endOf @value.leading.start.endOf
        value: (_)? @value @name.trailing.end.startOf @value.leading.end.startOf
      )
    )

    ;;!! var foo = ...;
    ;;!  ----^^^-------
    ;; Note that we can't merge this with the variable declaration above because
    ;; of https://github.com/tree-sitter/tree-sitter/issues/1442#issuecomment-1584628651
    (variable_declaration
      (variable_declarator)
      .
      (variable_declarator
        name: (_) @name @name.trailing.start.endOf @value.leading.start.endOf
        value: (_)? @value @name.trailing.end.startOf @value.leading.end.startOf
      )
    )
  ] @_.domain
  (#not-parent-type? @_.domain export_statement)

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! (let | const | var) aaa = ..., ccc = ...;
  ;;!  --------------------^^^--------^^^-------
  (#allow-multiple! @name)
  (#allow-multiple! @value)
)

(
  (export_statement
    (_
      ;;!! export [default] (let | const | var) foo = ...;
      ;;!  -------------------------------------^^^-------
      (variable_declarator
        name: (_) @name @name.trailing.start.endOf @value.leading.start.endOf
        value: (_)? @value @name.trailing.end.startOf @value.leading.end.startOf
      )
    )
  ) @_.domain

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! var foo = ..., bar = ...;
  ;;!  ----^^^--------^^^-------
  (#allow-multiple! @name)
  (#allow-multiple! @value)
)

(
  (_
    .
    (variable_declarator
      name: (_) @name @name.removal.end.endOf @value.leading.start.endOf
      value: (_)? @value @name.removal.end.startOf @value.leading.end.startOf
    ) @_.domain
    .
    (variable_declarator)
  ) @dummy @name.removal.start.startOf
)

(_
  (variable_declarator)
  .
  (variable_declarator
    name: (_) @name @name.trailing.start.endOf @value.leading.start.endOf
    value: (_)? @value @name.trailing.end.startOf @value.leading.end.startOf
  ) @_.domain
) @dummy

;;!! foo = ...;
;;!  ^^^-------
;;!! foo += ...;
;;!  ^^^--------
(expression_statement
  [
    (assignment_expression
      left: (_) @name @value.leading.start.endOf @name.trailing.start.endOf
      right: (_) @value @name.trailing.end.startOf @value.leading.end.startOf
    )

    (augmented_assignment_expression
      left: (_) @name @value.leading.start.endOf @name.trailing.start.endOf
      right: (_) @value @name.trailing.end.startOf @value.leading.end.startOf
    )
  ]
) @_.domain

;;!! foo = ...;
;;!  ^^^-------
(
  [
    (assignment_expression
      left: (_) @name @value.leading.start.endOf @name.trailing.start.endOf
      right: (_) @value @name.trailing.end.startOf @value.leading.end.startOf
    )

    (augmented_assignment_expression
      left: (_) @name @value.leading.start.endOf @name.trailing.start.endOf
      right: (_) @value @name.trailing.end.startOf @value.leading.end.startOf
    )
  ] @_.domain

  (#not-parent-type? @_.domain expression_statement)
)

[
  (program)
  (formal_parameters)
] @name.iteration @value.iteration

;; Treat interior of all bodies as iteration scopes for `name`, eg
;;!! function foo() {   }
;;!                  ***
(_
  body: (_
    .
    "{" @name.iteration.start.endOf @value.iteration.start.endOf
    "}" @name.iteration.end.startOf @value.iteration.end.startOf
    .
  )
)

(object
  "{" @value.iteration.start.endOf
  "}" @value.iteration.end.startOf
)

(_
  (_)? @value.leading.start.endOf
  .
  value: (_) @value @value.leading.end.startOf
) @_.domain

(shorthand_property_identifier) @value

(return_statement
  (_) @value
) @_.domain

(yield_expression
  (_) @value
) @_.domain
