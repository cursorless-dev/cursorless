;; https://github.com/r-lib/tree-sitter-r/blob/main/src/grammar.json
;; https://github.com/r-lib/tree-sitter-r/blob/main/src/node-types.json

[
  (for_statement)
  (if_statement)
  (repeat_statement)
  (function_definition)
  (while_statement)
] @statement

;;!! # hello
;;!  ^^^^^^^
(comment) @comment

;;!! if (x > 0) { }
;;!  ^^^^^^^^^^^^^^
(if_statement) @ifStatement

;; named function
;;!! abc <- function(x){ }
;;!  ^^^^^^^^^^^^^^^^^^^^^
(binary_operator
  ;;!! abc <- function(x){ }
  ;;!  ^^^
  lhs: (identifier) @name
  rhs: (function_definition
    name: "function"
    parameters: (parameters)
    body: (braced_expression)
  ) @name.trailing.startOf
) @namedFunction @_.domain

;; anonymous function
;;!! function(x){ }
;;!  ^^^^^^^^^^^^^^
(function_definition) @anonymousFunction

;; argument.actual
;;!! foo(a, b")
;;!      ^  ^
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

;; argument.formal
;;!! function(a, b){}
;;!           ^  ^
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

;; argumentList.actual
;;!! foo(a, b)
;;!      ^^^^
(call
  (arguments
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

;; argumentList.formal
;;!! foo <- function(a, b){ }
;;!                  ^^^^
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

;; argumentList.formal
;;!! function(a, b){}
;;!           ^^^^
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

(parameters
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

;; Function calls
;;!! foo()
;;!  ^^^^^
;;!  ^^^
;;!  -----

(call
  (identifier) @functionCallee
) @functionCall @functionCallee.domain

;; Technically lists and arrays are just calls to the function `list` or `c`
;;!! list(1, 2, 3)
;;!  ^^^^^^^^^^^^^
(call
  function: (identifier) @_dummy
  (#match? @_dummy "^(c|list)$")
) @list

(binary_operator
  ;;!! hello <- "world"
  ;;!  ^^^^^
  ;;!  -----
  lhs: (identifier) @name @value.leading.endOf
  operator: [
    "<-"
    "="
  ]
  ;;!! hello <- "world"
  ;;!           ^^^^^^^
  ;;!  -----
  rhs: (_) @value @name.trailing.startOf
) @_.domain

;;!! foo(hello)
;;!      ^^^^^
;;!  -----
;; (identifier) @value

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
