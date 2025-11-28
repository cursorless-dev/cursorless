;;!! fn foo() void {}
;;!           ^^^^
;;!  ^^^^^^^^^^^^^^^^ 
(function_declaration
  (builtin_type) @type
) @namedFunction

;;!! fn foo(aa: u8, bb:u8) void {}
;;!         ^^^^^^^^^^^^^          argumentList
;;!         ^^                     name
;;!             ^^                 type
;;!         ^^^^^^                 argumentOrParameter
(_
  (parameters
    "(" @argumentList.removal.start.endOf
    (_)? @_.leading.endOf
    .
    (parameter
      (identifier) @name
      ":"
      (builtin_type) @type
    ) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
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
