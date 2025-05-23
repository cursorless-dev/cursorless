;; https://github.com/r-lib/tree-sitter-r/blob/main/src/grammar.json
;; https://github.com/r-lib/tree-sitter-r/blob/main/src/node-types.json

[
  (for_statement)
  (if_statement)
  (repeat_statement)
  (function_definition)
  (while_statement)
  (function_definition)
] @statement

;;!! # hello
;;!  ^^^^^^^
(comment) @comment

;;!! if (x > 0) { }
;;!  ^^^^^^^^^^^^^^
(if_statement) @ifStatement

;; ;;!! if (TRUE) { print("hello") } else { print("world") }
;; ;;!      ^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
;; (if_statement
;;   "if" @branch.start
;;   (_) @condition
;;   consequence: (braced_expression) @branch.end
;;   alternative: (braced_expression)? @branch.end
;; ) @branch.iteration

;;!! function(x){ }
;;!  ^^^^^^^^^^^^^^
(function_definition) @anonymousFunction

;;!! foo("bar")
;;!      ^^^^^
(_
  arguments: (arguments
    ;; (
      (_)? @_.leading.endOf
      .
      (argument) @argumentOrParameter
      .
      (_)? @_.trailing.startOf
    ;; ) @_.domain
  ) @_dummy
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! function(a, b){ }
;;!           ^^^^
(_
  parameters: (parameters
    open: "(" @argumentList.start.endOf @argumentOrParameter.iteration.start.endOf
    ;; (parameter) @argumentOrParameter
    close: ")" @argumentList.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @_dummy
  (#empty-single-multi-delimiter! @argumentList.start.endOf @_dummy "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo(a, b)
;;!      ^^^^
(_
  arguments: (arguments
    open: "(" @argumentList.start.endOf @argumentOrParameter.iteration.start.endOf
    ;; (parameter) @argumentOrParameter
    close: ")" @argumentList.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @_dummy
  (#empty-single-multi-delimiter! @argumentList.start.endOf @_dummy "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

(arguments
  "(" @argumentOrParameter.iteration.start.endOf
  ")" @argumentOrParameter.iteration.end.startOf
) @argumentOrParameter.iteration.domain

(parameters
  "(" @argumentOrParameter.iteration.start.endOf
  ")" @argumentOrParameter.iteration.end.startOf
) @argumentOrParameter.iteration.domain

;;!! abc <- function(x){ }
;;!  ^^^^^^^^^^^^^^^^^^^^^
(binary_operator
  ;;!! abc <- function(x){ }
  ;;!  ^^^
  lhs: (identifier) @functionName
  rhs: (function_definition
    name: "function"
    parameters: (parameters)
    body: (braced_expression) @interior
  ) @functionName.trailing.startOf
) @namedFunction @_.domain

;;!! foo()
;;!  ^^^^^
;;!  -----
(call) @functionCall

;;!! foo()
;;!  ^^^
;;!  -----
(call
  (identifier) @functionCallee
)

;; Technically lists and arrays are just calls to the function `list` or `c`
;;!! list(1, 2, 3)
;;!  ^^^^^^^^^^^^^
(call
  function: (identifier) @functionName
  (#match? @functionName "^(c|list)$")
) @list

(binary_operator
  ;;!! hello <- "world"
  ;;!  ^^^^^
  ;;!  -----
  lhs: (identifier) @name @value.leading.endOf
  operator: "<-"
  ;;!! hello <- "world"
  ;;!           ^^^^^^^
  ;;!  -----
  rhs: (_) @value @name.trailing.startOf
) @_.domain
(binary_operator
  ;;!! hello <- "world"
  ;;!  ^^^^^
  lhs: (identifier) @name @value.leading.endOf
  operator: "="
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
