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
      (variable_declarator
          name: (_) @name
      )
    )

    ;;!! var foo = ...;
    ;;!  ----^^^-------
    ;; Note that we can't merge this with the variable declaration above because
    ;; of https://github.com/tree-sitter/tree-sitter/issues/1442#issuecomment-1584628651
    (variable_declaration
      (variable_declarator
          name: (_) @name
      )
    )
  ] @_.domain
  (#not-parent-type? @_.domain export_statement)

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! (let | const | var) aaa = ..., ccc = ...;
  ;;!  --------------------^^^--------^^^-------
  (#allow-multiple! @name)
)

(
  (export_statement
    (_
      ;;!! export [default] (let | const | var) foo = ...;
      ;;!  -------------------------------------^^^-------
      (variable_declarator
          name: (_) @name
      )
    )
  ) @_.domain

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! var foo = ..., bar = ...;
  ;;!  ----^^^--------^^^-------
  (#allow-multiple! @name)
)

;;!! foo += ...;
;;!  ^^^--------
(augmented_assignment_expression
    left: (_) @name
) @_.domain

;;!! foo = ...;
;;!  ^^^-------
(assignment_expression
    left: (_) @name
) @_.domain

[
  (program)
  (formal_parameters)
] @name.iteration

;; Treat interior of all bodies as iteration scopes for `name`, eg
;;!! function foo() {   }
;;!                  ***
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
