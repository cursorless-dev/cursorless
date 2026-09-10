[
  (if_statement)
  (while_statement)
  (for_statement)
  (c_style_for_statement)
  (function_definition)
  (declaration_command)
  (case_statement)
  (list)
  (redirected_statement)
  (test_command)
] @statement

(
  (subshell) @statement
  (#not-parent-type? @statement function_definition)
)

(
  [
    (variable_assignment)
    (command)
    (pipeline)
  ] @statement
  (#not-parent-type?
    @statement
    declaration_command
    c_style_for_statement
    list
    pipeline
    redirected_statement
    if_statement
    elif_clause
    while_statement
  )
  (#not-eq? @statement "")
)

;; Capture body statements without including commands before "then".
[
  (if_statement
    "then"
    [
      (command)
      (variable_assignment)
      (pipeline)
    ] @statement
  )
  (elif_clause
    "then"
    [
      (command)
      (variable_assignment)
      (pipeline)
    ] @statement
  )
]

(
  (program) @statementNameValue.iteration @namedFunction.iteration
  (#document-range! @statementNameValue.iteration @namedFunction.iteration)
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
;; Bash represents bracketed entries as concatenated key/value fragments.
;; Require the brackets and assignment before treating an array as a map.
(
  (array
    "(" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
    (concatenation
      .
      (word) @_open
      .
      (_)
      .
      (word) @_close
      .
      (word) @_assignment
    )
    ")" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
  ) @map
  (#eq? @_open "[")
  (#eq? @_close "]")
  (#match? @_assignment "^=")
)

;;!! foo=(["aaa"]=0 ["bbb"]=1)
;;!        ^^^^^     ^^^^^
;;!               ^         ^
(array
  (concatenation
    .
    (word) @_open
    .
    (_) @collectionKey
    .
    (word) @_close
    .
    (word) @value.start
    (_)? @value.end
    .
  ) @_.domain
  (#eq? @_open "[")
  (#eq? @_close "]")
  (#match? @value.start "^=")
  (#character-range! @value.start 1)
)

;;!! for v in values; do :; done
;;!      ^
;;!           ^^^^^^
[
  (for_statement
    variable: (_) @name
    .
    value: (_) @value
    .
    (comment)*
    .
    body: (do_group)
  )
  (for_statement
    variable: (_) @name
    .
    value: (_) @value.start
    value: (_)*
    value: (_) @value.end
    .
    (comment)*
    .
    body: (do_group)
  )
] @_.domain

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
    "then" @interior.start.endOf @statementNameValue.iteration.start.endOf
    "fi" @interior.end.startOf @statementNameValue.iteration.end.startOf
  ) @branch
  (#not-child-type? @branch elif_clause else_clause)
)

;;!! if true; then :; else :; fi
(
  (if_statement
    "if" @branch.start @branch.removal.start
    "then" @interior.start.endOf @statementNameValue.iteration.start.endOf
    (_) @branch.end @branch.removal.end
    .
    [
      (elif_clause)
      (else_clause)
    ] @branch.removal.end.startOf @interior.end.startOf @statementNameValue.iteration.end.startOf
  )
  (#not-type? @branch.end elif_clause else_clause)
  (#shrink-to-match! @branch.removal.end.startOf "^(?:el(?=if\\b))?(?<keep>.*)")
)

;;!! elif false; then
;;!       ^^^^^
(
  (elif_clause
    (_) @condition
    "then" @interior.start.endOf @statementNameValue.iteration.start.endOf
  ) @branch @branch.removal.start @condition.domain
  .
  _ @branch.removal.end.startOf @interior.end.startOf @statementNameValue.iteration.end.startOf
  (#trim-end! @branch)
)

;;!! else :; fi
(
  (else_clause
    "else" @interior.start.endOf @statementNameValue.iteration.start.endOf
  ) @branch @branch.removal.start
  "fi" @branch.removal.end.startOf @interior.end.startOf @statementNameValue.iteration.end.startOf
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
[
  (case_item
    .
    value: (_) @condition
    .
    ")"
  )
  (case_item
    .
    value: (_) @condition.start
    value: (_)*
    value: (_) @condition.end
    .
    ")"
  )
] @condition.domain

(case_item
  ")" @interior.start.endOf @statementNameValue.iteration.start.endOf
  [
    ";;"
    ";&"
    ";;&"
  ] @interior.end.startOf @statementNameValue.iteration.end.startOf
) @branch

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
  "do" @interior.start.endOf @statementNameValue.iteration.start.endOf
  "done" @interior.end.startOf @statementNameValue.iteration.end.startOf
)

;;!! foo() { }
;;!         ^
(compound_statement
  "{" @interior.start.endOf @statementNameValue.iteration.start.endOf
  "}" @interior.end.startOf @statementNameValue.iteration.end.startOf
)

;;!! foo() ( : )
;;!         ^^^
(subshell
  "(" @interior.start.endOf @statementNameValue.iteration.start.endOf
  ")" @interior.end.startOf @statementNameValue.iteration.end.startOf
)

;;!! # foo
;;!  ^^^^^
(comment) @comment @textFragment

;;!! var="foo"
;;!      ^^^^^
(string
  .
  (string_content)? @textFragment.start
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

;;!! function foo() {}
;;!           ^^^
(function_definition
  name: (_) @name
) @namedFunction @name.domain

;;!! for ((i = 1; i <= 5; i++)); do
;;!        ^
(
  (variable_assignment
    name: (_) @name @value.leading.endOf
    value: (_) @value @name.trailing.startOf
  ) @_dummy @_.domain
  (#not-parent-type? @_dummy declaration_command)
)

;;!! local foo="bar"
;;!        ^^^
(declaration_command
  (variable_assignment
    name: (_) @name
    value: (_) @_.removal.end.startOf
  )
) @name.domain @_.removal.start.startOf

;;!! local foo="bar"
;;!        ^^^
(declaration_command
  (variable_assignment
    name: (_) @_.leading.endOf
    value: (_) @value
  )
) @value.domain

;;!! local foo
;;!        ^^^
(declaration_command
  (variable_name) @name
) @name.domain
