;;!! (fn foo() void {})
;;!   ^^^^^^^^^^^^^^^^
(function_declaration) @namedFunction

;;!! (fn foo() void {})
;;!            ^^^^
(function_declaration
  (builtin_type) @type
)

;;!! (fn foo(aa: u8, bb:u8) void {})
(_
  (parameters
    "(" @argumentList.removal.start.endOf
    (parameter
      (identifier) @name
      ":"
      (builtin_type) @type
    ) @argumentOrParameter
    ")" @argumentList.removal.end.startOf
  ) @argumentList
  (#child-range! @argumentList 1 -2)
)

(call_expression
  (identifier) @functionCallee
  (arguments
    "("
    (_)* @argumentOrParameter
    ")"
  ) @argumentList
  (#child-range! @argumentList 1 -2)
) @functionCall

(statement) @statement

(variable_declaration
  (identifier) @name
  ":"
  (_) @type
  "="
  (_) @value
  ";"
) @statement

(variable_declaration
  (identifier) @name
  "="
  (_) @value
  ";"
) @statement
