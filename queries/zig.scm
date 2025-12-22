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
(_
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
  (#single-or-multi-line-delimiter! @argumentOrParameter @argumentOrParameter ", " ",\n")
)

;;!! fn foo(aa: u8, bb:u8) void {}
;;!         ^^^^^^^^^^^^^          argumentList
;;!  ----------------------------- ^domain
(function_declaration
  (parameters) @argumentList
  (#child-range! @argumentList 1 -2)
) @argumentList.domain

;;!! fn foo(aa: u8, bb:u8) void {}
;;!         ^^^^^^^^^^^^^
(_
  (parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

;; (parameters
;;   "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
;;   ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
;; )

;;!! foo(aaa, bbb);
;;!  ^^^            functionCallee
;;!      ^^  ^^     argumentOrParameter
;;!      ^^^^^^     argumentList
;;!  -----------    functionCall argumentList.domain
(call_expression
  function: (_) @functionCallee
  (arguments
    (_)* @argumentOrParameter
  ) @argumentList
  (#child-range! @argumentList 1 -2)
) @functionCall @functionCallee.domain @argumentList.domain

;;!! foo(aaa, bbb);
;;!      ^^^  ^^^
(
  (arguments
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  )
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @argumentOrParameter ", " ",\n")
)

(statement) @statement

;;!! const foo: *const [3]u8 = "bar";
;;!        ^^^                          name
;;!             ^^^^^^^^^^^^            type
;;!                            ^^^^^    value
;;!  --------------------------------   statement ^domain
(variable_declaration
  (identifier) @name @type.leading.endOf
  type: (_)? @type @name.leading.endOf
  "="
  (_) @value
  ";"
) @statement @_.domain
