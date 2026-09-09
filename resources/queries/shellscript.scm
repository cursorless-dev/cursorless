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
  (test_command)
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
  (program) @statement.iteration @namedFunction.iteration
  (#document-range! @statement.iteration @namedFunction.iteration)
)
(
  (program) @name.iteration @value.iteration
  (#document-range! @name.iteration @value.iteration)
)

;;!! [[ $foo =~ ^\w+$ ]]
;;!             ^^^^^
(regex) @regularExpression @textFragment

;;!! foo=(aaa bbb)
;;!      ^^^^^^^^^
(array) @list

;;!! foo=(["aaa"]=0 ["bbb"]=1)
;;!      ^^^^^^^^^^^^^^^^^^^^^
;;!       ^^^^^^^^^^^^^^^^^^^
(array
  "(" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  (concatenation)
  ")" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
) @map

;;!! foo=(["aaa"]=0 ["bbb"]=1)
;;!        ^^^^^     ^^^^^
;;!               ^         ^
(array
  (concatenation
    (string) @collectionKey
    (_) @value
    .
  ) @_.domain
  (#character-range! @value 1)
)

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
) @condition.domain

;;!! while true; do :; done
;;!        ^^^^
(while_statement
  condition: (_) @condition
) @condition.domain

;;!! if true; then :; fi
;;!     ^^^^
(if_statement
  condition: (_) @condition
) @condition.domain

;;!! elif false; then
;;!       ^^^^^
(elif_clause
  (_) @condition
  "then"
) @branch @condition.domain

;;!! else :; fi
(else_clause) @branch

;;!! ((true ? 0 : 1))
;;!    ^^^^
(ternary_expression
  condition: (_) @condition
  consequence: (_) @branch
) @condition.domain @branch.iteration

(ternary_expression
  alternative: (_) @branch
)

;;!! case $foo in esac
;;!       ^^^^
;;!              ^
(case_statement
  value: (_) @value
  "in" @branch.iteration.start.endOf @condition.iteration.start.endOf
  "esac" @branch.iteration.end.startOf @condition.iteration.end.startOf
) @value.domain

;;!! 0) : ;;
;;!  ^
(case_item
  value: (_) @condition
) @condition.domain

;;!! return 0
;;!         ^
(
  (command
    name: (command_name
      (word) @_dummy
    )
    argument: (_) @value
  ) @value.domain
  (#eq? @_dummy return)
)

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

;;
;; Functions
;;

;;!! foo aaa bbb
;;!  ^^^^^^^^^^^
;;!  ^^^
(command
  name: (_) @functionCallee
) @functionCallee.domain @functionCall

;;!! foo aaa bbb
;;!      ^^^^^^^
(command
  name: (_)
  .
  argument: (_) @argumentList.start @argumentOrParameter.iteration.start
  argument: (_)? @argumentList.end @argumentOrParameter.iteration.end
  .
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo
;;!    ><
(command
  name: (_) @argumentList.start.endOf
  !argument
) @argumentList.domain

;;!! foo aaa bbb
;;!      ^^^ ^^^
(_
  (command
    name: (_)
    argument: (_)? @_.leading.endOf
    .
    argument: (_) @argumentOrParameter
    .
    argument: (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy " " " \\\n")
)

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
