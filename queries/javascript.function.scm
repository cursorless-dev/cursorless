;; Note that there are a few Typescript-specific function declarations that we
;; don't handle here; see typescript.scm.
;; We also don't handle function declarations that only exist in Javascript;
;; see javascript.scm.

;; Anonymous functions
[
  ;;!! function() {}
  (function_expression
    !name
  )

  ;;!! function *() {}
  (generator_function
    !name
  )

  ;;!! () => {}
  (arrow_function)
] @anonymousFunction

;; If we export an anonymous function as default, it semantically feels like a
;; named function.
(export_statement
  [
    ;;!! export default function() {}
    (function_expression
      !name
    )

    ;;!! export default function *() {}
    (generator_function
      !name
    )

    ;;!! export default () => {}
    (arrow_function)
  ]
) @namedFunction

;; Named functions without export
(
  [
    ;;!! function foo() {}
    (function_declaration)

    ;;!! function *foo() {}
    (generator_function_declaration)

    ;;!! (let | const) foo = () => {}
    ;;!! (let | const) foo = function() {}
    ;;!! (let | const) foo = function *() {}
    (lexical_declaration
      (variable_declarator
        value: [
          (function_expression
            !name
          )
          (generator_function
            !name
          )
          (arrow_function)
        ]
      )
    )

    ;;!! var foo = () => {}
    ;;!! var foo = function() {}
    ;;!! var foo = function *() {}
    ;; Note that we can't merge this with the variable declaration above because
    ;; of https://github.com/tree-sitter/tree-sitter/issues/1442#issuecomment-1584628651
    (variable_declaration
      (variable_declarator
        value: [
          (function_expression
            !name
          )
          (generator_function
            !name
          )
          (arrow_function)
        ]
      )
    )
  ] @namedFunction
  (#not-parent-type? @namedFunction export_statement)
)

;; Exported named functions
(export_statement
  [
    ;;!! export [default] function foo() {}
    (function_declaration)

    ;;!! export [default] function *foo() {}
    (generator_function_declaration)

    ;;!! export [default] (let | const | var) foo = function() {}
    ;;!! export [default] (let | const | var) foo = function *() {}
    ;;!! export [default] (let | const | var) foo = () => {}
    (_
      (variable_declarator
        value: [
          (function_expression
            !name
          )
          (generator_function
            !name
          )
          (arrow_function)
        ]
      )
    )
  ]
) @namedFunction

;;!! (function foo() {})
;;!! (function *foo() {})
[
  (function_expression
    name: (_)
  )
  (generator_function
    name: (_)
  )
] @namedFunction

;;!! foo = function() {};
;;!! foo = function *() {};
;;!! foo = () => {};
(assignment_expression
  right: [
    (function_expression
      !name
    )
    (generator_function
      !name
    )
    (arrow_function)
  ]
) @namedFunction

;;!! { foo: function() {} }
;;!! { foo: *() {} }
;;!! { foo: () => {} }
(pair
  key: (_) @name
  value: [
    (function_expression
      !name
    )
    (generator_function
      !name
    )
    (arrow_function)
  ] @name.trailing.startOf
) @namedFunction @name.domain

;;!! class Foo { @bar foo() {} }
;;!              ^^^^^^^^^^^^^
(
  (decorator)? @namedFunction.start @name.domain.start
  .
  (method_definition
    name: (_) @name
  ) @namedFunction.end @name.domain.end
)

(
  (program) @namedFunction.iteration
  (#document-range! @namedFunction.iteration)
)

[
  (class_declaration)
  (object
    (method_definition)
  )
] @namedFunction.iteration

(class_body
  "{" @namedFunction.iteration.start.endOf
  "}" @namedFunction.iteration.end.startOf
)
