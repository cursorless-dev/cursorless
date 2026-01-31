;; https://github.com/tree-sitter/tree-sitter-scala/blob/master/src/grammar.json

[
  (package_clause)
  (class_definition)
  (enum_definition)
  (trait_definition)
  (var_definition)
  (val_definition)
  (val_declaration)
  (assignment_expression)
  (function_definition)
  (instance_expression)
  (call_expression)
  (match_expression)
  (return_expression)
  (while_expression)
  (do_while_expression)
  (for_expression)
  (try_expression)
] @statement

(
  (compilation_unit) @class.iteration @statement.iteration @namedFunction.iteration
  (#document-range! @class.iteration @statement.iteration @namedFunction.iteration)
)

(
  (compilation_unit) @name.iteration @value.iteration @type.iteration
  (#document-range! @name.iteration @value.iteration @type.iteration)
)

(
  (if_expression) @ifStatement @statement
  (#not-parent-type? @ifStatement if_expression)
)

[
  (string)
  (interpolated_string_expression)
] @string @textFragment

[
  (comment)
  (block_comment)
] @comment @textFragment

;; treating classes = classlike
[
  (class_definition
    name: (_) @name
  )
  (object_definition
    name: (_) @name
  )
  (trait_definition
    name: (_) @name
  )
] @class @name.domain

;;!! class Foo { }
;;!             ^
(template_body
  "{" @class.iteration.start.endOf @namedFunction.iteration.start.endOf
  "}" @class.iteration.end.startOf @namedFunction.iteration.end.startOf
)

;;!! { }
;;!   ^
(_
  "{" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  "}" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)
(_
  "{" @statement.iteration.start.endOf
  "}" @statement.iteration.end.startOf
)

;;!! foo()
;; does not count foo.size (field_expression), or foo size (postfix_expression)
(call_expression
  function: (_) @functionCallee
) @functionCall @functionCallee.domain

;;!! new Foo()
(instance_expression
  "new" @functionCallee.start
  (type_identifier) @functionCallee.end
) @functionCall @functionCallee.domain

;;!! () => {}
(lambda_expression) @anonymousFunction

;;!! () => 0
;;!        ^
(lambda_expression
  "=>"
  (_) @value
  (#not-type? @value block)
) @value.domain

;;!! def foo() {}
(function_definition
  name: (_) @name
) @namedFunction @name.domain

;;!! foo match {}
;;!  ^^^
(match_expression
  value: (_) @value
) @value.domain

;;!! for (v <- values) {}
(for_expression
  (enumerators
    (enumerator
      (_) @name
      "<-"
      (_) @value
    )
  )
) @_.domain

(
  (_
    name: (_) @name
  ) @name.domain
  (#not-type? @name.domain simple_enum_case full_enum_case)
)

(_
  pattern: (_) @name
) @name.domain

(enum_case_definitions
  [
    ;;!! case Bar
    (simple_enum_case
      name: (_) @name
    )
    ;;!! case Baz(x: Int)
    (full_enum_case
      name: (_) @name
    )
  ]
) @name.domain

;;!! foo = 0
;;!  ^^^
;;!        ^
(assignment_expression
  left: (_) @name @value.leading.endOf
  right: (_) @value
) @_.domain

(_
  condition: (_
    .
    "(" @condition.start.endOf
    ")" @condition.end.startOf
    .
  )
) @_.domain

;;!! type Vector = (Int, Int)
;;!                ^^^^^^^^^^
(type_definition
  name: (_) @_.leading.endOf
  type: (_) @value
) @_.domain

;;!! class Example(foo: String = "foo") {}
;;!                              ^^^^^
(_
  (_) @_.leading.endOf
  .
  default_value: (_) @value
) @_.domain

;;!! val bar = "bar"
;;!            ^^^^^
(_
  (_) @_.leading.endOf
  .
  value: (_) @value
) @_.domain

;;!! type Vector = (Int, Int)
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^
(type_definition) @type

;;!! def str(bar: String)
;;!               ^^^^^^
;;!! val foo: String = "foo"
;;!           ^^^^^^
(
  (_
    (_) @_.leading.endOf
    .
    type: (_) @type
  ) @_.domain
  (#not-type? @_.domain type_definition)
)

;;!! def str(): String = "bar"
;;!             ^^^^^^
(function_definition
  (parameters) @_.leading.endOf
  return_type: (_) @type
) @_.domain

;;!! return 0
;;!         ^
(return_expression
  (_) @value
) @value.domain

;;!! case 0 => "zero"
;;!  ^^^^^^^^^^^^^^^^
(
  (case_clause) @branch
  (#trim-end! @branch)
)

;;!! class Foo(aaa: Int, bbb: Int) {}
;;!            ^^^^^^^^  ^^^^^^^^
(
  (class_parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! def foo(aaa: Int, bbb: Int) = x
;;!          ^^^^^^^^  ^^^^^^^^
(
  (parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa, bbb)
;;!      ^^^  ^^^
(
  (arguments
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! class Foo(aaa: Int, bbb: Int) {}
;;!            ^^^^^^^^^^^^^^^^^^
(_
  (class_parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! def foo(aaa: Int, bbb: Int) = x
;;!          ^^^^^^^^^^^^^^^^^^
(_
  (parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo(aaa, bbb)
;;!      ^^^^^^^^
(_
  (arguments
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

operator: (operator_identifier) @disqualifyDelimiter
(enumerator
  "<-" @disqualifyDelimiter
)
(view_bound
  "<%" @disqualifyDelimiter
)
(upper_bound
  "<:" @disqualifyDelimiter
)
(lower_bound
  ">:" @disqualifyDelimiter
)
(lambda_expression
  "=>" @disqualifyDelimiter
)
(function_type
  "=>" @disqualifyDelimiter
)
(case_clause
  "=>" @disqualifyDelimiter
)
