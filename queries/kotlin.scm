;; Define @statement based on parent node, because a statement can be an arbitrary expression (with
;; no expression_statement parent node) and we don't want every nested expression to be a statement.
(source_file
  (_) @statement
  (#not-type? @statement import_list)
)
(
  (import_header) @statement
)
(statements
  (_) @statement
)
(control_structure_body
  (_) @statement
  (#not-type? @statement statements)
)
(class_body
  (_) @statement
)
(enum_class_body
  (_) @statement
)

(class_declaration
  (type_identifier) @name @className
) @class @_.domain
(object_declaration
  (type_identifier) @name @className
) @class @_.domain
(companion_object
  (type_identifier) @name @className
) @class @_.domain

(function_declaration
  (simple_identifier) @name @functionName
) @namedFunction @_.domain
(secondary_constructor) @namedFunction

(anonymous_function) @anonymousFunction
(lambda_literal) @anonymousFunction

(if_expression) @ifStatement

(string_literal) @string @textFragment

[
  (line_comment)
  (multiline_comment)
] @comment @textFragment

[
  (call_expression)
  (constructor_invocation)
  (constructor_delegation_call)
  (enum_entry
    (value_arguments)
  )
] @functionCall

(when_entry) @branch

(when_entry
  [
    (when_condition)
    "else"
  ] @condition
) @_.domain

(when_expression) @branch.iteration @condition.iteration

(if_expression
  "if"
  .
  "("
  .
  (_) @condition
  .
  ")"
) @_.domain

(if_expression
  "if" @branch.start @branch.removal.start
  .
  "("
  .
  (_)
  .
  ")"
  .
  (control_structure_body) @branch.end @branch.removal.end
  (
    "else"
    (control_structure_body) @branch.removal.end.startOf
  )
?
)

(if_expression
  "else" @branch.start @condition.domain.start
  (control_structure_body
    (if_expression
      "if"
      .
      "("
      .
      (_) @condition
      .
      ")"
      .
      (control_structure_body) @branch.end @condition.domain.end
    )
  )
)

(if_expression
  "else" @branch.start
  (control_structure_body) @branch.end
)

(while_statement
  "while"
  .
  "("
  .
  (_) @condition
  .
  ")"
) @_.domain

(do_while_statement
  "("
  .
  (_) @condition
  .
  ")"
  .
) @_.domain

(when_expression
  (when_subject) @private.switchStatementSubject
  (#child-range! @private.switchStatementSubject 0 -1 true true)
) @_.domain

(type_alias
  "typealias"
  .
  (_) @name.start
  (_)? @name.end
  .
  "="
  .
  (_) @value.start @type.start
) @value.end.endOf @type.end.endOf @_.domain

(class_parameter
  (simple_identifier) @name
) @_.domain

(class_parameter
  ":"
  .
  (_) @type.start
  (_)? @type.end
  .
  "="
  (_) @value
) @_.domain

;; Known issue: this won't work with multiple-node types.
(class_parameter
  ":"
  .
  (_) @type
  .
) @_.domain

;; (type_parameter
;;   (type_identifier) @name @type
;; ) @name.domain

;; (type_parameter
;;   ":"
;;   .
;;   (_) @type.start
;; ) @type.end.endOf

;; (type_constraint
;;   (type_identifier) @name @type
;; ) @name.domain

;; (type_constraint
;;   ":"
;;   .
;;   (_) @type.start
;; ) @type.end.endOf

;; Function declarations with type constraints
(function_declaration
  ":"
  .
  (_) @type
  .
  (type_constraints)
) @_.domain
(function_declaration
  ":"
  .
  (_) @type.start
  (_) @type.end
  .
  (type_constraints)
) @_.domain

;; Function declarations with no type constraints but with body
(
  (function_declaration
    ":"
    .
    (_) @type
    .
    (function_body)
  ) @_.domain
)
(
  (function_declaration
    ":"
    .
    (_) @type.start
    (_) @type.end
    .
    (function_body)
  ) @_.domain
  (#not-type? @type.end "type_constraints")
)

;; Function declaration without body or type constraints
(
  (function_declaration
    ":"
    .
    (_) @type
    .
  ) @_.domain
)
(
  (function_declaration
    ":"
    .
    (_) @type.start
    (_) @type.end
    .
  ) @_.domain
  (#not-type? @type.end "function_body")
  (#not-type? @type.end "type_constraints")
)

(variable_declaration
  (simple_identifier) @name
) @_.domain

(variable_declaration
  ":"
  .
  (_) @type.start
) @type.end.endOf @_.domain

(multi_variable_declaration) @name.iteration @type.iteration

(property_declaration
  (variable_declaration
    (simple_identifier) @name
  )
) @_.domain

(property_declaration
  "="
  .
  (_) @value
) @_.domain

(property_declaration
  (property_delegate
    (_) @value
  )
) @_.domain

(property_declaration
  (variable_declaration
    ":"
    .
    (_) @type.start
  ) @type.end.endOf
) @_.domain

(property_declaration
  (multi_variable_declaration) @name.iteration @type.iteration
) @name.iteration.domain @type.iteration.domain

(for_statement
  (variable_declaration
    (simple_identifier) @name
  )
) @_.domain

(for_statement
  "in"
  .
  (_) @value
) @_.domain

(for_statement
  (variable_declaration
    ":"
    .
    (_) @type.start
  ) @type.end.endOf
) @_.domain

(for_statement
  (multi_variable_declaration) @name.iteration @type.iteration
) @name.iteration.domain @type.iteration.domain

(when_subject
  (variable_declaration
    (simple_identifier) @name
  )
) @_.domain

(when_subject
  "="
  .
  (_) @value
) @_.domain

(when_subject
  (variable_declaration
    ":"
    .
    (_) @type.start
  ) @type.end.endOf
) @_.domain

(getter
  ":"
  .
  (_) @type.start
  (_)? @type.end
  (function_body)
) @_.domain

(setter
  ":"
  .
  (_) @type.start
  (_)? @type.end
  (function_body)
) @_.domain

(parameter_with_optional_type
  (simple_identifier) @name
) @_.domain

(parameter_with_optional_type
  ":"
  .
  (_) @type.start
) @type.end.endOf @_.domain

;; Function parameter without default
(function_value_parameters
  (parameter
    (simple_identifier) @name
    ":"
    .
    (_) @type.start
  ) @type.end.endOf @_.domain
)

;; Function parameter with default
(function_value_parameters
  (parameter
    (simple_identifier) @name
    ":"
    .
    (_) @type.start
  ) @type.end.endOf @_.domain.start
  .
  "="
  .
  (_) @value @_.domain.end
)

(type_arguments
  (type_projection) @type
)

(anonymous_function
  ":"
  .
  (_) @type.start
  (_)? @type.end
  .
  (function_body)
) @_.domain

(
  (anonymous_function
    ":"
    .
    (_) @type
    .
  ) @_.domain
)
(
  (anonymous_function
    ":"
    .
    (_) @type.start
    (_) @type.end
    .
  ) @_.domain
  (#not-type? @type.end "function_body")
)

(catch_block
  (simple_identifier) @name
  ":"
  .
  (_) @type.start
  (_)? @type.end
  .
  ")"
) @_.domain

(jump_expression
  [
    "return"
    "throw"
  ]
  .
  (_) @value
) @_.domain

;; Disabled due to Cursorless error.
;; (jump_expression
;;   "return@"
;;   .
;;   (label)
;;   .
;;   (_) @value
;; ) @_.domain

(_
  (function_body
    "="
    .
    (_) @value
  )
) @_.domain

(assignment
  (directly_assignable_expression) @name
  (_) @value
  .
) @_.domain

(value_argument
  (simple_identifier) @name
  "="
  .
  (_) @value.start
) @value.end.endOf @_.domain

(infix_expression
  (_) @collectionKey
  (simple_identifier) @_dummy
  (#eq? @_dummy "to")
  (_) @value
) @_.domain

(class_body
  .
  "{" @type.iteration.start.endOf
  "}" @type.iteration.end.startOf
  .
)

;; TODO add more type iteration scopes

;; TODO add functionCallee and argumentOrParameter, looking at functionCall

;; TODO add (label) support
