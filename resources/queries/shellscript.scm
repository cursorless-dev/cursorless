;;
;; Statements
;;

;; (
;;   (program
;;     (_) @statement
;;   )
;;   (#not-type? @statement comment)
;; )

[
  (if_statement)
  (while_statement)
  (for_statement)
  (c_style_for_statement)
  (function_definition)
  (declaration_command)
  (case_statement)
  (subshell)
  (list)
  (redirected_statement)
] @statement

(
  [
    (variable_assignment)
    (command)
  ] @statement
  (#not-parent-type?
    @statement
    declaration_command
    c_style_for_statement
    list
    redirected_statement
    if_statement
    elif_clause
    while_statement
  )
)

(
  (program) @statement.iteration
  (#document-range! @statement.iteration)
)

;;!! [[ $foo =~ ^\w+$ ]]
;;!             ^^^^^
(regex) @regularExpression @textFragment

;;!! for v in values; do :; done
;;!      ^
;;!           ^^^^^^
(for_statement
  variable: (_) @name
  value: (_) @value
) @_.domain

;;!! for ((i = 0; i < 2; i++)); do :; done
;;!               ^^^^^
(c_style_for_statement
  condition: (_) @condition
) @_.domain

;;!! while true; do :; done
;;!        ^^^^
(while_statement
  condition: (_) @condition
) @_.domain

;;!! if true; then :; fi
;;!     ^^^^
(if_statement
  condition: (_) @condition
) @_.domain

;;!! elif false; then
;;!       ^^^^^
(elif_clause
  (_) @condition
  "then"
) @branch @_.domain

;;!! else :; fi
(else_clause) @branch

(ternary_expression
  condition: (_) @condition
) @_.domain

;;
;; Conditionals
;;

(if_statement) @ifStatement @branch.iteration @condition.iteration

;;!! if [ $value -le 0 ]; then
;;!!     echo foo
;;!! fi
;; (
;;   (if_statement
;;     "if" @condition.domain.start.startOf @branch.start.startOf
;;     (_) @condition
;;     "then" @interior.start.endOf
;;     (_) @_dummy
;;     .
;;     "fi" @condition.domain.end.startOf @branch.end.startOf @interior.end.startOf
;;   )
;;   (#not-type? @_dummy else_clause elif_clause)
;; )

;;!! if [ $value -le 0 ]; then
;;!!     echo foo
;;!! elif [ $value -le 0 ]; then
;;!! fi
;; (
;;   (if_statement
;;     "if" @condition.domain.start.startOf @branch.start.startOf
;;     (_) @condition
;;     "then" @interior.start.endOf
;;     (_)
;;     (elif_clause) @condition.domain.end.startOf @branch.end.startOf @interior.end.startOf
;;   )
;; )

;;!! if [ $value -le 0 ]; then
;;!!     echo foo
;;!! else [ $value -le 0 ]; then
;;!! fi
;; (
;;   (if_statement
;;     "if" @condition.domain.start.startOf @branch.start.startOf
;;     (_) @condition
;;     "then" @interior.start.endOf
;;     (_) @_dummy
;;     .
;;     (else_clause) @condition.domain.end.startOf @branch.end.startOf @interior.end.startOf
;;   )
;;   (#not-type? @_dummy elif_clause)
;; )

;;!! elif [ $value -le 0 ]; then
;;!! else
;; (elif_clause
;;   (_) @condition
;;   "then"
;;   .
;; ) @branch @_.domain

;;!! elif [ $value -le 0 ]; then
;;!!    echo "foo1"
;;!!    echo "foo1"
;; (elif_clause
;;   (_) @condition
;;   "then" @interior.start.endOf
;;   (_)
;; ) @branch @_.domain @interior.end.endOf

;;!! else
;;!!     echo "foo1"
;;!!     echo "foo1"
;;!! fi
;; (else_clause
;;   "else" @interior.start.endOf
;;   (_)
;; ) @branch @interior.end.endOf

;; (_
;;   condition: (_) @condition
;; )

;; (case_statement) @branch.iteration @condition.iteration
;; (case_item
;;   value: (_) @condition
;;   .
;;   ")" @interior.start.endOf
;;   (_) @interior.end.endOf
;;   .
;;   ";;"
;; ) @branch @_.domain

;; Lists and maps
;;

;;!! array=("a" "b" "c")
;;!        ^^^^^^^^^^^^^
;;!        -------------
;; (array
;;   "(" @interior.start.endOf
;;   (_)? @collectionItem
;;   ")" @interior.end.startOf
;; ) @list @collectionItem.iteration

;;!! FIXME: I will file an issue in tree-sitter-bash as I think the grammar is
;;!! bad. But the below does work for now
;;!! arr+=(["key2"]=val2 ["key3"]=val3)
;; (array
;;   (
;;     (concatenation
;;       ;; This matches the [ which is (word) for some reason
;;       (_) @collectionKey.leading.startOf
;;       (_) @collectionKey
;;       ;; This matches the ] which is also (word) for some reason
;;       (_) @collectionKey.trailing.endOf
;;       (_) @value
;;     ) @collectionItem
;;     (#shrink-to-match! @value "\=(?<keep>.*)")
;;   )
;; )

;;
;; Strings
;;

;;!! # foo
;;!  ^^^^^
(comment) @comment @textFragment

;;!! var="foo"
;;!      ^^^^^
(string
  .
  (string_content) @textFragment.start
  (string_content)? @textFragment.end
  .
) @string

;;!! var="foo ${bar}"
;;!           ^^^^^^
;;!           xxxxxx
(string
  (
    (expansion) @argumentOrParameter
    ;; FIXME: This is due to a tree-sitter-bash bug (imo) where given: "Foo ${BAR} ${BAZ}"
    ;; ${BAZ} incorrectly includes preceding space
    (#shrink-to-match! @argumentOrParameter "\\s*(?<keep>.*)")
  )
)
(string
  (simple_expansion) @argumentOrParameter
  (#shrink-to-match! @argumentOrParameter "\\s*(?<keep>.*)")
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
  name: (_) @name
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
    (_)? @interior
  )
) @namedFunction @_.domain

;;
;; Names, values, and types
;;

;;!! for ((i = 1; i <= 5; i++)); do
;;!        ^
;;!        xxxx
;;!        -----
(
  (variable_assignment
    name: (_) @name @value.leading.endOf
    value: (_) @value @name.trailing.startOf
  ) @_dummy @_.domain
  (#not-parent-type? @_dummy declaration_command)
)

;;!! local foo="bar"
;;!        ^^^
;;!  xxxxxxxxxx
;;!  ---------------
(declaration_command
  (variable_assignment
    name: (_) @name
    value: (_) @_.removal.end.startOf
  )
) @_.domain @_.removal.start.startOf

;;!! local foo="bar"
;;!        ^^^
;;!  xxxxxxxxxx
;;!  ---------------
(declaration_command
  (variable_assignment
    name: (_) @_.leading.endOf
    value: (_) @value
  )
) @_.domain

;;!! local foo
;;!        ^^^
;;!  ---------
(declaration_command
  (variable_name) @name
) @_.domain
