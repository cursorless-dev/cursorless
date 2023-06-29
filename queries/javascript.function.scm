;; Anonymous functions
[
  ;;!! function() {}
  (function
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
    (function
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
    (function_declaration
      name: (_) @functionName
    )

    ;;!! function *foo() {}
    (generator_function_declaration
      name: (_) @functionName
    )

    ;;!! (let | const) foo = () => {}
    ;;!! (let | const) foo = function() {}
    ;;!! (let | const) foo = function *() {}
    (lexical_declaration
      (variable_declarator
        name: (_) @functionName
        value: [
          (function
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
        name: (_) @functionName
        value: [
          (function
            !name
          )
          (generator_function
            !name
          )
          (arrow_function)
        ]
      )
    )
  ] @namedFunction @functionName.domain
  (#not-parent-type? @namedFunction export_statement)
)

;; Exported named functions
(export_statement
  [
    ;;!! export [default] function foo() {}
    (function_declaration
      name: (_) @functionName
    )

    ;;!! export [default] function *foo() {}
    (generator_function_declaration
      name: (_) @functionName
    )

    ;;!! export [default] (let | const | var) foo = () => {}
    ;;!! export [default] (let | const | var) foo = function() {}
    ;;!! export [default] (let | const | var) foo = function *() {}
    (_
      (variable_declarator
        name: (_) @functionName
        value: [
          (function
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
) @namedFunction @functionName.domain

;; Note that there are a few Typescript-specific function declarations that we
;; don't handle here; see typescript.scm.
;; We also don't handle function declarations that only exist in Javascript;
;; see javascript.scm.
[
  ;;!! (function foo() {})
  (function
    name: (_) @functionName
  )

  ;;!! (function *foo() {})
  (generator_function
    name: (_) @functionName
  )

  ;;!! class Foo { foo() {} }
  ;;!              ^^^^^^^^
  (method_definition
    name: (_) @functionName
  )

  ;;!! foo = () => {};
  ;;!! foo = function() {};
  ;;!! foo = function *() {};
  (assignment_expression
    left: (_) @functionName
    right: [
      (function
        !name
      )
      (generator_function
        !name
      )
      (arrow_function)
    ]
  )
] @namedFunction @functionName.domain

[
  (program)
  (class_declaration)
  (object
    (method_definition)
  )
] @namedFunction.iteration @functionName.iteration
