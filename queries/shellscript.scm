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
  (command)
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

;;!!
(if_statement
  (_)*
  "then"
  (_)*
  "fi"
) @ifStatement @branch

(if_statement
  "if" @branch.start.startOf
  (_)
  "then"
  (_)* @branch.interior
  .
  [
    (elif_clause)
    (else_clause)
  ] @branch.end.startOf
) @ifStatement @branch.iteration @_.domain

(elif_clause
  (_)* @condition
  "then"
  (_)* @branch.interior
) @branch

(else_clause
  "else" @branch.interior.start.endOf
  (_) @branch.interior.end.endOf
) @branch

(_
  condition: (_) @condition
) @_.domain

;;
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
    "{"
    .
    (_)? @_.interior
    .
    "}"
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
