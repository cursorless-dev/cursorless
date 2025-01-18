[
  (class_declaration)
  (struct_declaration)
  (enum_declaration)
  (protocol_declaration)
  (extension_declaration)
  (import_declaration)
  (if_statement)
  (guard_statement)
  (for_statement)
  (while_statement)
  (repeat_while_statement)
  (switch_statement)
  (do_statement)
  (defer_statement)
  (return_statement)
  (break_statement)
  (continue_statement)
  (fallthrough_statement)
  (throw_statement)
  (do_catch_statement)
  (expression_statement)
  (variable_declaration)
  (constant_declaration)
  (function_declaration)
  (initializer_declaration)
  (subscript_declaration)
  (operator_declaration)
  (deinitializer_declaration)
  (typealias_declaration)
  (associatedtype_declaration)
  (import_declaration)
  (access_level_modifier)
  (member_access)
  (identifier)
  (identifier_pattern)
  (identifier_expression)
  (identifier_expression_pattern)
  (identifier_reference)
] @statement

(class_declaration
  name: (_) @name @className
) @class @_.domain

(struct_declaration
  name: (_) @name @structName
) @struct @_.domain

(enum_declaration
  name: (_) @name @enumName
) @enum @_.domain

(protocol_declaration
  name: (_) @name @protocolName
) @protocol @_.domain

(extension_declaration
  name: (_) @name @extensionName
) @extension @_.domain

(function_declaration
  name: (_) @name @functionName
) @namedFunction @_.domain

(subscript_declaration
  name: (_) @name @subscriptName
) @subscript @_.domain

(initializer_declaration
  name: (_) @name @initializerName
) @initializer @_.domain

(deinitializer_declaration
  name: (_) @name @deinitializerName
) @deinitializer @_.domain

(variable_declaration
  name: (_) @name @variableName
) @variable @_.domain

(constant_declaration
  name: (_) @name @constantName
) @constant @_.domain

(return_statement
  value: (_) @value
) @return @_.domain

(if_statement
  condition: (_) @condition
  consequence: (block) @consequence
  alternative: (else_clause)? @alternative
) @ifStatement @_.domain

(for_statement
  variable: (_) @variable
  iterable: (_) @iterable
  body: (block) @body
) @forLoop @_.domain

(while_statement
  condition: (_) @condition
  body: (block) @body
) @whileLoop @_.domain

(repeat_while_statement
  body: (block) @body
  condition: (_) @condition
) @repeatWhileLoop @_.domain

(switch_statement
  condition: (_) @condition
  cases: (switch_case)+ @cases
) @switchStatement @_.domain

(do_statement
  body: (block) @body
) @doStatement @_.domain

(defer_statement
  body: (block) @deferBody
) @deferStatement @_.domain

(throw_statement
  expression: (_) @throwExpression
) @throwStatement @_.domain

(do_catch_statement
  do_block: (block) @doBlock
  catch_clauses: (catch_clause)+ @catchClauses
) @doCatchStatement @_.domain

(variable_declaration
  pattern: (_) @pattern
  initializer: (_) @initializer
) @variableDeclaration @_.domain

# Additional patterns and configurations can be added here as needed.

operator: [
  "+"
  "-"
  "*"
  "/"
  "%"
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "&&"
  "||"
  "!"
  "="
  "+="
  "-="
  "*="
  "/="
  "%="
  "++"
  "--"
  "->"
  "?."
  "!"
  "??"
] @disqualifyDelimiter

(lambda_expression
  "in" @disqualifyDelimiter
)
