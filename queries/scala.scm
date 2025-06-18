;; https://github.com/tree-sitter/tree-sitter-scala/blob/master/src/grammar.json

(if_expression) @ifStatement

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
    name: (_) @className
  )
  (object_definition
    name: (_) @className
  )
  (trait_definition
    name: (_) @className
  )
] @class @className.domain

;; list.size(), does not count foo.size (field_expression), or foo size (postfix_expression)
(call_expression) @functionCall

(lambda_expression) @anonymousFunction

(function_definition
  name: (_) @functionName
) @namedFunction @functionName.domain

(match_expression
  value: (_) @private.switchStatementSubject
) @_.domain

(_
  name: (_) @name
) @_.domain
(_
  pattern: (_) @name
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
  (#child-range! @argumentList 1 -2)
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! def foo(aaa: Int, bbb: Int) = x
;;!          ^^^^^^^^^^^^^^^^^^
(_
  (parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#child-range! @argumentList 1 -2)
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo(aaa, bbb)
;;!      ^^^^^^^^
(_
  (arguments
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#child-range! @argumentList 1 -2)
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
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
