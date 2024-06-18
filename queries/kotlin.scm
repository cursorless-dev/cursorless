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

(function_declaration
  (simple_identifier) @name @functionName
) @namedFunction @_.domain
(secondary_constructor) @namedFunction

(anonymous_function) @anonymousFunction

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
