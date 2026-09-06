;; https://github.com/r-lib/tree-sitter-r/blob/main/src/grammar.json
;; https://github.com/r-lib/tree-sitter-r/blob/main/src/node-types.json

[
  (for_statement)
  (repeat_statement)
  (while_statement)
  (next)
  (break)

  ;; Disabled on purpose. We have a better definition of these below.
  ;; (if_statement)
  ;; (function_definition)
  ;; (binary_operator)
  ;; (call)
] @statement

(program
  [
    (binary_operator)
    (call)
  ] @statement
)

(braced_expression
  [
    (binary_operator)
    (call)
  ] @statement
)

(program) @statement.iteration @namedFunction.iteration
(program) @name.iteration @value.iteration

;;!! { }
;;!   ^
(_
  .
  "{" @interior.start.endOf
  "}" @interior.end.startOf
  .
)
(_
  .
  "{" @statement.iteration.start.endOf @name.iteration.start.endOf @value.iteration.start.endOf
  "}" @statement.iteration.end.startOf @name.iteration.end.startOf @value.iteration.end.startOf
  .
)

;;!! # hello world
;;!  ^^^^^^^^^^^^^
(comment) @comment @textFragment

;;!! "hello world"
;;!  ^^^^^^^^^^^^^
;;!   ^^^^^^^^^^^
(string
  (string_content)? @textFragment
) @string

;;!! if () {} else {}
(
  (if_statement) @ifStatement @statement @branch.iteration
  (#not-parent-type? @ifStatement if_statement)
)

;;!! if () {}
(
  (if_statement
    "if" @branch.start @branch.removal.start
    condition: (_) @condition
    consequence: (_) @branch.end @branch.removal.end
    "else"? @branch.removal.end.startOf
    alternative: (if_statement)? @branch.removal.end.startOf
  ) @condition.domain
  (#not-parent-type? @condition.domain if_statement)
  (#insertion-delimiter! @branch.start " ")
)

;;!! else if () {}
(if_statement
  "else" @branch.start @condition.domain.start
  alternative: (if_statement
    condition: (_) @condition
    consequence: (_) @branch.end @condition.domain.end
  )
  (#insertion-delimiter! @branch.start " ")
)

;;!! else {}
(if_statement
  "else" @branch.start
  alternative: (braced_expression) @branch.end
  (#insertion-delimiter! @branch.start " ")
)

;;!! foo <- function(){}
;;!  ^^^^^^^^^^^^^^^^^^^
;;!  ^^^
(binary_operator
  lhs: (identifier) @name
  rhs: (function_definition) @name.trailing.startOf
) @namedFunction @statement @_.domain

;;!! function(){}
;;!  ^^^^^^^^^^^^
(function_definition) @anonymousFunction

;;!! foo(aaa, bbb)
;;!      ^^^  ^^^
(
  (arguments
    (
      (argument) @_.leading.endOf
      .
      (comma)
    )?
    .
    (argument) @argumentOrParameter
    .
    (
      (comma)
      .
      (argument) @_.trailing.startOf
    )?
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! function(aaa, bbb){}
;;!           ^^^  ^^^
(
  (parameters
    (
      (parameter) @_.leading.endOf
      .
      (comma)
    )?
    .
    (parameter) @argumentOrParameter
    .
    (
      (comma)
      .
      (parameter) @_.trailing.startOf
    )?
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa = 0)
;;!      ^^^^^^^
(arguments
  "(" @name.iteration.start.endOf @value.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf
)

;;!! function(aaa, bbb){}
;;!           ^^^^^^^^
(parameters
  "(" @name.iteration.start.endOf @value.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf
)

;;!! foo(aaa = 0)
;;!      ^^^
;;!            ^
(argument
  name: (_) @name @value.leading.endOf
  value: (_) @value @name.trailing.startOf
) @_.domain

;;!! function(aaa = 0)
;;!           ^^^
;;!                 ^
(parameter
  name: (_) @name @value.leading.endOf
  default: (_)? @value @name.trailing.startOf
) @_.domain

;;!! foo(aaa, bbb)
;;!      ^^^^^^^^
(call
  (arguments
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo <- function(aaa, bbb){}
;;!                  ^^^^^^^^
(binary_operator
  (function_definition
    (parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! function(aaa, bbb){}
;;!           ^^^^^^^^
(
  (function_definition
    (parameters
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  ) @argumentList.domain @argumentOrParameter.iteration.domain
  (#not-parent-type? @argumentList.domain binary_operator)
)

;;!! foo()
;;!  ^^^^^
;;!  ^^^
(call
  function: (_) @functionCallee
) @functionCall @functionCallee.domain

;; Technically lists and arrays are just calls to the function `list` or `c`
;;!! list(1, 2, 3)
;;!  ^^^^^^^^^^^^^
(call
  function: (_) @_dummy
  (#match? @_dummy "^(c|list)$")
) @list

;;!! switch(foo, )
;;!         ^^^
;;!         ^^^^^
(call
  function: (_) @_dummy
  (arguments
    "(" @branch.iteration.start.endOf @condition.iteration.start.endOf
    .
    (argument)? @value
    ")" @branch.iteration.end.startOf @condition.iteration.end.startOf
  )
  (#eq? @_dummy switch)
) @value.domain

;;!! switch(foo, aaa=0)
;;!              ^^^
;;!              ^^^^^
(call
  function: (_) @_dummy
  (arguments
    .
    (argument)
    [
      (argument
        name: (_) @condition
      )
      (argument
        !name
        value: (_) @condition
      )
    ] @branch @condition.domain
  )
  (#eq? @_dummy switch)
)

;;!! switch(foo, aaa=0)
;;!                  ^
(call
  function: (_) @_dummy
  (arguments
    .
    (argument)
    (argument
      "=" @interior.start.endOf
      value: (_) @interior.end.endOf
    )
  )
  (#eq? @_dummy switch)
  (#not-type? @interior.end.endOf braced_expression)
)

;;!! tryCatch({})
;;!           ^^
(call
  function: (_) @_dummy
  (arguments
    (argument) @branch
  )
  (#eq? @_dummy tryCatch)
)

;;!! tryCatch( )
;;!           ^
(call
  function: (_) @_dummy
  (arguments
    "(" @branch.iteration.start.endOf
    ")" @branch.iteration.end.startOf
  )
  (#eq? @_dummy tryCatch)
)

;;!! return(0, 1)
;;!         ^^^^
(call
  function: (return)
  (arguments
    "("
    .
    (argument) @value.start
    (argument)? @value.end
    .
    ")"
  )
) @value.domain

;;!! foo <- 0
;;!  ^^^
;;!         ^
(binary_operator
  lhs: (_) @name @value.leading.endOf
  operator: [
    "<-"
    "="
  ]
  rhs: (_) @value @name.trailing.startOf
) @_.domain

;;!! while (TRUE) {}
(while_statement
  condition: (_) @condition
) @condition.domain

;;!! for (v in values) {}
;;!       ^
;;!            ^^^^^^
(for_statement
  variable: (_) @name
  sequence: (_) @value
) @_.domain

(_
  operator: [
    "<"
    ">"
    "<-"
    "->"
    "<="
    ">="
    "<<-"
    "->>"
    "|>"
  ] @disqualifyDelimiter
)
