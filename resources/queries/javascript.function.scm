;; Note that there are a few Typescript-specific function declarations that we
;; don't handle here; see typescript.scm.
;; We also don't handle function declarations that only exist in Javascript;
;; see javascript.scm.

;; Anonymous functions

[
  ;;!! function () {}
  (function_expression
    !name
  )

  ;;!! function* () {}
  (generator_function
    !name
  )

  ;;!! () => {}
  (arrow_function)
] @anonymousFunction

;; --------------------------------------------------------------------------

;; Anonymous functions argument lists

;;!! function () {}
(
  (function_expression
    !name
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  ) @argumentList.domain @argumentOrParameter.iteration.domain
  (#not-parent-type? @argumentList.domain export_statement variable_declarator assignment_expression pair field_definition public_field_definition)
)

;;!! function* () {}
(
  (generator_function
    !name
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  ) @argumentList.domain @argumentOrParameter.iteration.domain
  (#not-parent-type? @argumentList.domain export_statement variable_declarator assignment_expression pair field_definition public_field_definition)
)

;;!! () => {}
(
  (arrow_function
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  ) @argumentList.domain @argumentOrParameter.iteration.domain
  (#not-parent-type? @argumentList.domain export_statement variable_declarator assignment_expression pair field_definition public_field_definition)
)

;; --------------------------------------------------------------------------

;; If we export an anonymous function as default, it semantically feels like a
;; named function.

;;!! export default function() {}
(export_statement
  (function_expression
    !name
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! export default function* () {}
(export_statement
  (generator_function
    !name
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! export default () => {}
(export_statement
  (arrow_function
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;; --------------------------------------------------------------------------

;; Named functions without export

;;!! function foo() {}
(
  (function_declaration
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  ) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain
  (#not-parent-type? @namedFunction export_statement)
)

;;!! function* foo() {}
(
  (generator_function_declaration
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  ) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain
  (#not-parent-type? @namedFunction export_statement)
)

;;!! (let | const | var) foo = function () {}
(
  (_
    (variable_declarator
      (function_expression
        !name
        (formal_parameters
          "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
          ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
        ) @argumentList
        (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
        (#child-range! @argumentList 1 -2)
      )
    )
  ) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain
  (#not-parent-type? @namedFunction export_statement)
)

;;!! (let | const | var) foo = function* () {}
(
  (_
    (variable_declarator
      (generator_function
        !name
        (formal_parameters
          "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
          ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
        ) @argumentList
        (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
        (#child-range! @argumentList 1 -2)
      )
    )
  ) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain
  (#not-parent-type? @namedFunction export_statement)
)

;;!! (let | const | var) foo = () => {}
(
  (_
    (variable_declarator
      (arrow_function
        (formal_parameters
          "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
          ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
        ) @argumentList
        (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
        (#child-range! @argumentList 1 -2)
      )
    )
  ) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain
  (#not-parent-type? @namedFunction export_statement)
)

;; --------------------------------------------------------------------------

;; Exported named functions

;;!! export [default] function foo() {}
(export_statement
  (function_declaration
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! export [default] function* foo() {}
(export_statement
  (generator_function_declaration
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! export [default] (let | const | var) foo = function() {}
(export_statement
  (_
    (variable_declarator
      (function_expression
        !name
        (formal_parameters
          "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
          ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
        ) @argumentList
        (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
        (#child-range! @argumentList 1 -2)
      )
    )
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! export [default] (let | const | var) foo = function* () {}
(export_statement
  (_
    (variable_declarator
      (generator_function
        !name
        (formal_parameters
          "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
          ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
        ) @argumentList
        (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
        (#child-range! @argumentList 1 -2)
      )
    )
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! export [default] (let | const | var) foo = () => {}
(export_statement
  (_
    (variable_declarator
      (arrow_function
        (formal_parameters
          "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
          ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
        ) @argumentList
        (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
        (#child-range! @argumentList 1 -2)
      )
    )
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;; --------------------------------------------------------------------------

;;!! (function foo() {})
(function_expression
  name: (_)
  (formal_parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! (function* foo() {})
(generator_function
  name: (_)
  (formal_parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo = function() {};
(assignment_expression
  (function_expression
    !name
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo = function* () {};
(assignment_expression
  (generator_function
    !name
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo = () => {};
(assignment_expression
  (arrow_function
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! { foo: function() {} }
(pair
  (function_expression
    !name
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! { foo: *() {} }
(pair
  (generator_function
    !name
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

;;!! { foo: () => {} }
(pair
  (arrow_function
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @namedFunction @argumentList.domain @argumentOrParameter.iteration.domain

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
) @name.domain

;;!! class Foo { @bar foo() {} }
(
  (decorator)? @namedFunction.start @statement.start @name.domain.start
  .
  (method_definition
    name: (_) @name
  ) @namedFunction.end @statement.end @name.domain.end
)

;;!! class Foo { @bar foo() {} }
(
  (decorator)? @argumentList.domain.start @argumentOrParameter.iteration.domain.start
  .
  (method_definition
    (formal_parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  ) @argumentList.domain.end @argumentOrParameter.iteration.domain.end
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
