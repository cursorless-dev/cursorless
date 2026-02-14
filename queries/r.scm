;; https://github.com/r-lib/tree-sitter-r/blob/main/src/grammar.json
;; https://github.com/r-lib/tree-sitter-r/blob/main/src/node-types.json

[
  (for_statement)
  (repeat_statement)
  (while_statement)
  (binary_operator)
  (call)
  (next)
  (break)

  ;; Disabled on purpose. We have a better definition of these below.
  ;; (if_statement)
  ;; (function_definition)
] @statement

;;!! { }
;;!   ^
(_
  .
  "{" @interior.start.endOf
  "}" @interior.end.startOf
  .
)

(program) @statement.iteration @namedFunction.iteration
(program) @name.iteration @value.iteration

;;!! # hello world
;;!  ^^^^^^^^^^^^^
(comment) @comment @textFragment

;;!! "hello world"
;;!  ^^^^^^^^^^^^^
;;!   ^^^^^^^^^^^
(string
  (string_content)? @textFragment
) @string

;;!! if (TRUE) {} else {}
(
  (if_statement
    condition: (_) @condition
  ) @ifStatement @statement @condition.domain
  (#not-parent-type? @ifStatement if_statement)
)

;;!! else if (TRUE) {}
(if_statement
  "else" @condition.domain.start
  alternative: (if_statement
    condition: (_) @condition
    consequence: (_) @condition.domain.end
  )
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

;;!! switch(foo, ...)
;;!         ^^^
(call
  function: (_) @_dummy
  (arguments
    "("
    .
    (argument) @value
  )
  (#eq? @_dummy switch)
) @value.domain

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

;; ;; from https://github.com/r-lib/tree-sitter-r/blob/main/queries/highlights.scm
;; ;; Plus magrittr operators
;; operator: [ "?" ":=" "=" "<-" "<<-" "->" "->>"
;;   "~" "|>" "||" "|" "&&" "&"
;;   "<" "<=" ">" ">=" "==" "!="
;;   "+" "-" "*" "/" "::" ":::"
;;   "**" "^" "$" "@" ":" "%in%"
;;   "%>%" "%<>%" "%T>%" "%$%"
;;   "special"
;; ] @disqualifyDelimiter
