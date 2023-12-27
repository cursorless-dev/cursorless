;;
;; Statements
;;

(
  (program
    (_) @statement
  )
  (#not-type? @statement comment)
)
[
  (if_statement)
  (function_definition)
  (declaration_command)
] @statement

(
  (_
    (variable_assignment) @statement
    (#not-parent-type? @statement declaration_command)
  )
)

;;
;; Conditionals
;;

(if_statement) @ifStatement @branch.iteration

;; Branch
(
  (if_statement
    "if" @branch.start.startOf @branch.domain.start.startOf
    (_)
    "then"
    (_) @branch.interior @dummy
    "fi" @branch.end.startOf @branch.domain.end.startOf
  )
  (#not-type? @dummy elif_clause else_clause)
)

;; Conditional

;;!! if [ $value -le 0 ]; then
;;!! fi
(if_statement
  "if" @condition.domain.start.startOf
  (_) @condition
  "then" @condition.domain.end.endOf
  .
  "fi"
)

;;!! if [ $value -le 0 ]; then
;;!! else
(if_statement
  "if" @condition.domain.start.startOf
  (_) @condition
  "then" @condition.domain.end.endOf
  .
  (else_clause)
)

;;!! if [ $value -le 0 ]; then
;;!! elif
(if_statement
  "if" @condition.domain.start.startOf
  (_) @condition
  "then" @condition.domain.end.endOf
  .
  (elif_clause)
)

;;!! if [ $value -le 0 ]; then
;;!!     echo foo
;;!! fi
(
  (if_statement
    "if" @condition.domain.start.startOf
    (_) @condition
    "then"
    (_) @dummy
    .
    "fi" @condition.domain.end.startOf
  )
  (#not-type? @dummy else_clause elif_clause)
)

;;!! if [ $value -le 0 ]; then
;;!!     echo foo
;;!! elif [ $value -le 0 ]; then
;;!! fi
(
  (if_statement
    "if" @condition.domain.start.startOf
    (_) @condition
    "then"
    (_)
    (elif_clause) @condition.domain.end.startOf
  )
)

;;!! if [ $value -le 0 ]; then
;;!!     echo foo
;;!! else [ $value -le 0 ]; then
;;!! fi
(
  (if_statement
    "if" @condition.domain.start.startOf
    (_) @condition
    "then"
    (_) @dummy
    .
    (else_clause) @condition.domain.end.startOf
  )
  (#not-type? @dummy elif_clause)
)

(elif_clause
  (_) @condition
  "then"
  (_) @branch.interior
) @branch @_.domain

(else_clause
  "else" @branch.interior.start.endOf
  (_) @branch.interior.end.endOf
) @branch

(_
  condition: (_) @condition
)

;; Lists and maps
;;

;;!! array=("a" "b" "c")
;;!        ^^^^^^^^^^^^^
;;!        -------------
(array
  "(" @_.interior.start.endOf
  (_)? @collectionItem
  ")" @_.interior.end.startOf
) @list @collectionItem.iteration

;;
;; Strings
;;

;;!! # foo
;;!  ^^^^^
(comment) @comment @textFragment

;;!! var="foo"
;;!      ^^^^^
(string) @string @textFragment

;;!! var="foo ${bar}"
;;!           ^^^^^^
(string
  [
    (expansion)
    (simple_expansion)
  ] @argumentOrParameter
)

;;
;; Functions
;;

;;!! echo "foo"
;;!       ^^^^^
(_
  argument: (_) @argumentOrParameter
) @_.iteration

;; call:
;;!! echo "foo"
;;!  ^^^^^^^^^^
;; callee:
;;!! echo "foo"
;;!  ^^^^
;;!  ----------
(command
  name: (_) @functionCallee
) @_.domain @functionCall @command

;;!! function foo() {
;;!           ^^^
;;!  ----------------
;;!!    echo "foo"
;;!     ----------
;;!! }
;;!  -
(function_definition
  name: (_) @functionName
) @_.domain

;; FIXME: Need to support redirections
;; interior:
;;!! function foo() {
;;!  ----------------
;;!!    echo "foo"
;;!     ^^^^^^^^^^
;;!     ----------
;;!! }
;;!  -
(function_definition
  body: (_
    (_)? @_.interior
  )
) @namedFunction @_.domain

;;
;; Names, values, and types
;;

;;!! foo="bar"
;;!  ^^^
;;!  xxxx
;;!  ---------
(
  (variable_assignment
    name: (_) @name @_.trailing.start.startOf
    .
    "=" @_.trailing.end.endOf
  ) @dummy @_.domain
  (#not-parent-type? @dummy declaration_command)
)

;;!! local foo="bar"
;;!        ^^^
;;!  xxxxxxxxxx
;;!  ---------------
(declaration_command
  "local" @_.domain.start.startOf @_.trailing.start.startOf
  (variable_assignment
    name: (_) @name
    .
    "=" @_.trailing.end.endOf
  ) @_.domain.end.endOf
)

;;!! foo="bar"
;;!      ^^^^^
;;!     xxxxxx
;;!  ---------
(
  (variable_assignment
    "=" @value.leading.start.startOf
    .
    value: (_) @value @value.leading.end.endOf
  ) @dummy @_.domain
  (#not-parent-type? @dummy declaration_command)
)

(declaration_command
  "local" @_.domain.start.startOf
  (variable_assignment
    "=" @value.leading.start.startOf
    .
    value: (_) @value @value.leading.end.endOf
  ) @_.domain.end.endOf
)
