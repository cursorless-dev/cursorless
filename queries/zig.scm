;;!! fn foo() void {}
;;!     ^^^           name
;;!           ^^^^    type
;;!  ---------------- namedFunction ^domain
(function_declaration
  name: (_) @name
  type: (_) @type
) @namedFunction @_.domain

;;!! fn foo(aa: u8) void {}
;;!         ^^                     name
;;!             ^^                 type
;;!         ^^^^^^                 argumentOrParameter ^domain
;;!  ----------------------        ^domain
(function_declaration
  (parameters
    (_)? @_.leading.endOf
    .
    (parameter
      (identifier) @name
      ":"
      type: (_) @type
    ) @argumentOrParameter @_.domain
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
) @argumentOrParameter.domain @_.domain

;;!! fn foo(aa: u8, bb:u8) void {}
;;!         ^^^^^^^^^^^^^          argumentList
;;!  ----------------------------- ^domain
(function_declaration
  (parameters) @argumentList
  (#child-range! @argumentList 1 -2)
) @argumentList.domain

;;!! foo(aa, bb);
;;!  ^^^            functionCallee
;;!      ^^^^^^     argumentList
;;!      ^^  ^^     argumentOrParameter
;;!  -----------    functionCall ^domain
(call_expression
  function: (_) @functionCallee
  (arguments
    (_)* @argumentOrParameter
  ) @argumentList @_.domain
  (#child-range! @argumentList 1 -2)
) @functionCall @_.domain

(statement) @statement

;;!! const foo: *const [3]u8 = "bar";
;;!        ^^^                          name
;;!             ^^^^^^^^^^^^            type
;;!                            ^^^^^    value
;;!  --------------------------------   statement ^domain
(variable_declaration
  (identifier) @name
  type: (_)? @type
  "="
  (_) @value
  ";"
) @statement @_.domain
