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

;; ;;!! if (TRUE) { print("hello") } else { print("world") }
;; ;;!      ^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
;; (if_statement
;;   "if" @branch.start
;;   (_) @condition
;;   consequence: (braced_expression) @branch.end
;;   alternative: (braced_expression)? @branch.end
;; ) @branch.iteration

;; named function
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
) @namedFunction @namedFunction.domain @functionName.domain

;; anonymous function
;;!! function(x){ }
;;!  ^^^^^^^^^^^^^^
(function_definition) @anonymousFunction

;; argument.actual
;;!! foo("bar")
;;!      ^^^^^
(
  (arguments
    (
      (argument) @_.leading.endOf
      (comma)
    )?
    .
    (argument) @argumentOrParameter
    .
    (
      (comma)
      (argument) @_.trailing.startOf
    )?
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;; argument.formal
;;!! function(a, b){}
;;!           ^^^^
(
  (parameters
    (
      (parameter) @_.leading.endOf
      (comma)
    )?
    .
    (parameter) @argumentOrParameter
    .
    (
      (comma)
      (parameter) @_.trailing.startOf
    )?
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

[
  ;; argument.actual
  ;;!! foo(a, b)
  ;;!      ^^^^
  (call
   arguments: (arguments
     open: "(" @argumentList.start.endOf @argumentOrParameter.iteration.start.endOf
     close: ")" @argumentList.end.startOf @argumentOrParameter.iteration.end.startOf
     ) @_dummy @argumentOrParameter.iteration.domain
   (#empty-single-multi-delimiter! @argumentList.start.endOf @_dummy "" ", " ",\n")
  )

  ;; argument.formal
  ;;!! function(a, b){}
  ;;!           ^^^^
  (function_definition
   parameters: (parameters
     open: "(" @argumentList.start.endOf @argumentOrParameter.iteration.start.endOf
     close: ")" @argumentList.end.startOf @argumentOrParameter.iteration.end.startOf
     ) @_dummy
   (#empty-single-multi-delimiter! @argumentList.start.endOf @_dummy "" ", " ",\n")
  )
] @argumentList.domain @argumentOrParameter.iteration.domain

(arguments
  "(" @argumentOrParameter.iteration.start.endOf
  ")" @argumentOrParameter.iteration.end.startOf
)

(parameters
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

;;!! function(a, b){ }
;;!           ^^^^
;; For domain, have to handle either named or unnamed function using
;; alternation, to ensure that the function name is part of the domain if it
;; exists
[
  (binary_operator
   (function_definition
    parameters: (parameters
      open: "(" @argumentList.start.endOf @argumentOrParameter.iteration.start.endOf
      close: ")" @argumentList.end.startOf @argumentOrParameter.iteration.end.startOf
      ) @_dummy
    (#empty-single-multi-delimiter! @argumentList.start.endOf @_dummy "" ", " ",\n")
   )
  )
  (function_definition
   parameters: (parameters
     open: "(" @argumentList.start.endOf @argumentOrParameter.iteration.start.endOf
     close: ")" @argumentList.end.startOf @argumentOrParameter.iteration.end.startOf
     ) @_dummy
   (#empty-single-multi-delimiter! @argumentList.start.endOf @_dummy "" ", " ",\n")
  )
] @argumentList.domain


;; Function calls
;;!! foo()
;;!  ^^^^^
;;!  -----
(call) @functionCall @argumentOrParameter.iteration.domain

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
  operator: ["<-" "="]
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
