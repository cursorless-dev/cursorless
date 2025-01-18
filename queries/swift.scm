;; https://github.com/tree-sitter/tree-sitter-swift/blob/master/src/grammar.json

;; Basic statements and declarations
[
  (function_declaration)
  (class_declaration)
  (struct_declaration)
  (protocol_declaration)
  (enum_declaration)
  (extension_declaration)
  (import_declaration)
  (variable_declaration)
  (if_statement)
  (guard_statement)
  (for_statement)
  (while_statement)
  (repeat_while_statement)
  (do_statement)
  (return_statement)
  (break_statement)
  (continue_statement)
  (throw_statement)
  (switch_statement)
] @statement

;; String literals
(line_string_literal) @string

;; Comments
[
  (line_comment)
  (multiline_comment)
] @comment

;; Class declarations
(class_declaration
  name: (_) @className
) @class @_.domain

;; Function declarations
(function_declaration
  name: (_) @functionName
) @namedFunction @_.domain

;; Method declarations in classes/protocols
(function_declaration
  name: (_) @functionName
) @namedFunction @_.domain

;; Initializer declarations
(initializer_declaration) @namedFunction @_.domain

;; Anonymous functions (closures)
(closure_expression) @anonymousFunction

;; Function calls
(call_expression) @functionCall

;; Function callee
(call_expression
  function: (_) @functionCallee
) @_.domain

;; Collections
(array_expression) @list
(dictionary_expression) @map

;; Dictionary key-value pairs
(dictionary_element
  key: (_) @key @value.leading.endOf
  value: (_) @value @key.trailing.startOf
) @_.domain

;; Control flow
(if_statement) @ifStatement

;; Switch statement and cases
(switch_statement
  condition: (_) @condition
) @_.domain

(switch_case
  value: (_) @condition
) @branch @_.domain

(default_case) @branch

;; If statement branches
(if_statement
  condition: (_) @condition
  body: (_) @branch
  alternative: (_)? @branch
) @_.domain

;; Try-catch blocks
(do_statement
  "try" @branch.start
  body: (_) @branch.end
)

(catch_clause) @branch

;; Parameters
(parameter
  name: (_) @name
  type: (_) @type
) @_.domain

;; Variable declarations
(variable_declaration
  pattern: (_) @name
  type: (_)? @type
  value: (_)? @value
) @_.domain

;; Type annotations
(type_annotation
  type: (_) @type
) @_.domain

;; Return type annotations
(function_declaration
  return_type: (_) @type
) @_.domain

;; Function arguments
(call_expression
  arguments: (tuple_expression
    (_)? @_.leading.endOf
    .
    (_) @argument.actual
    .
    (_)? @_.trailing.startOf
  )
) @_.domain

;; Function parameters
(parameter_clause
  (_)? @_.leading.endOf
  .
  (_) @argument.formal
  .
  (_)? @_.trailing.startOf
) @_.domain
