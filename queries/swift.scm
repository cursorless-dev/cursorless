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
(line_string_literal) @string @textFragment

;; Comments
[
  (line_comment)
  (multiline_comment)
] @comment @textFragment

;; Class declarations
(class_declaration
  name: (_) @className
) @class @_.domain

;; Function declarations
(function_declaration
  name: (_) @functionName
) @namedFunction @functionName.domain

;; Method declarations in classes/protocols
(function_declaration
  name: (_) @functionName
) @namedFunction.method @functionName.method.domain

;; Initializer declarations
(initializer_declaration) @namedFunction.constructor @functionName.constructor.domain

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
  key: (_) @collectionKey @value.leading.endOf
  value: (_) @value @collectionKey.trailing.startOf
) @_.domain

;; Control flow
(if_statement) @ifStatement

;; Switch statement and cases
(switch_statement
  condition: (_) @private.switchStatementSubject
) @_.domain

(switch_case
  value: (_) @condition
) @branch @condition.domain

(default_case) @branch

(switch_statement) @branch.iteration @condition.iteration

;; If statement branches
(if_statement
  condition: (_) @condition
  body: (_) @branch.end.endOf @branch.removal.end.endOf
  alternative: (_
    (if_statement) @branch.removal.end.startOf
  )?
) @branch.start.startOf @branch.removal.start.startOf @condition.domain

;; Else if branches
(else_clause
  (if_statement
    condition: (_) @condition
    body: (_) @branch.end.endOf @condition.domain.end.endOf
  )
) @branch.start.startOf @condition.domain.start.startOf

;; Else branches
(else_clause
  (code_block)
) @branch

;; If statement iteration
(if_statement) @branch.iteration

;; Try-catch blocks
(do_statement
  "try" @branch.start
  body: (_) @branch.end
)

(catch_clause) @branch

(do_statement) @branch.iteration

;; Conditions
(if_statement
  condition: (_) @condition
) @_.domain

(while_statement
  condition: (_) @condition
) @_.domain

(guard_statement
  condition: (_) @condition
) @_.domain

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

;; Operators that should be disqualified as delimiters
operator: [
  "<"
  "<="
  ">"
  ">="
] @disqualifyDelimiter

;; Function arguments
(call_expression
  arguments: (tuple_expression
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  )
) @_.domain

;; Parameter list iteration scope
(parameter_clause
  "(" @argumentOrParameter.iteration.start.endOf
  ")" @argumentOrParameter.iteration.end.startOf
) @argumentOrParameter.iteration.domain

;; Argument list iteration scope
(call_expression
  arguments: (tuple_expression
    "(" @argumentOrParameter.iteration.start.endOf
    ")" @argumentOrParameter.iteration.end.startOf
  )
) @argumentOrParameter.iteration.domain

;; Block iteration scopes
(code_block
  "{" @statement.iteration.start.endOf @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  "}" @statement.iteration.end.startOf @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

;; Class/struct body iteration scope
[
  (class_declaration)
  (struct_declaration)
] @namedFunction.method.iteration.class @functionName.method.iteration.class

;; File-level iteration scope
(source_file) @statement.iteration @name.iteration @value.iteration @type.iteration @namedFunction.iteration @functionName.iteration
