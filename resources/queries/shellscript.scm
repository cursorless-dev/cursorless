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
(if_statement) @ifStatement @branch.iteration @condition.iteration

;;!! if true; then :; fi
;;!     ^^^^
(if_statement
  condition: (_) @condition
) @condition.domain

;;!! if true; then :; fi
(
  (if_statement
    "then" @interior.start.endOf
    "fi" @interior.end.startOf
  ) @branch
  (#not-child-type? @branch elif_clause else_clause)
)

;;!! if true; then :; else :; fi
(
  (if_statement
    "if" @branch.start @branch.removal.start
    "then" @interior.start.endOf
    (_) @branch.end @branch.removal.end
    .
    [
      (elif_clause)
      (else_clause)
    ] @branch.removal.end.startOf @interior.end.startOf
  )
  (#not-type? @branch.end elif_clause else_clause)
  (#shrink-to-match! @branch.removal.end.startOf "^(?:el(?=if\\b))?(?<keep>.*)")
)

;;!! elif false; then
;;!       ^^^^^
(
  (elif_clause
    (_) @condition
    "then" @interior.start.endOf
  ) @branch @branch.removal.start @condition.domain
  .
  _ @branch.removal.end.startOf @interior.end.startOf
  (#trim-end! @branch)
)

;;!! else :; fi
(
  (else_clause
    "else" @interior.start.endOf
  ) @branch @branch.removal.start
  "fi" @branch.removal.end.startOf @interior.end.startOf
  (#trim-end! @branch)
)

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
  "in" @interior.start.endOf @branch.iteration.start.endOf @condition.iteration.start.endOf
  "esac" @interior.end.startOf @branch.iteration.end.startOf @condition.iteration.end.startOf
) @value.domain

;;!! 0) : ;;
;;!  ^
(case_item
  value: (_) @condition
  ")" @interior.start.endOf
  ";;" @interior.end.startOf
) @branch @condition.domain

(case_item
  ")" @statement.iteration.start.endOf @name.iteration.start.endOf @value.iteration.start.endOf
  ";;" @statement.iteration.end.startOf @name.iteration.end.startOf @value.iteration.end.startOf
)

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

;;!! do :; done
;;!    ^^^^
(do_group
  "do" @interior.start.endOf
  "done" @interior.end.startOf
)

(do_group
  "do" @statement.iteration.start.endOf @name.iteration.start.endOf @value.iteration.start.endOf
  "done" @statement.iteration.end.startOf @name.iteration.end.startOf @value.iteration.end.startOf
)

;;!! foo() { }
;;!         ^
(compound_statement
  "{" @interior.start.endOf
  "}" @interior.end.startOf
)

(compound_statement
  "{" @statement.iteration.start.endOf @name.iteration.start.endOf @value.iteration.start.endOf
  "}" @statement.iteration.end.startOf @name.iteration.end.startOf @value.iteration.end.startOf
)

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
