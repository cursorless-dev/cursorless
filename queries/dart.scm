;; https://github.com/UserNobody14/tree-sitter-dart/blob/master/src/grammar.json

[
  (library_import)
  (class_definition)
  (expression_statement)
  (return_statement)
  (yield_statement)
  (while_statement)
  (try_statement)
  (do_statement)
  (break_statement)
  (continue_statement)
  (for_statement)
  (switch_statement)
  (enum_declaration)
  (type_alias)
] @statement

;;!! var foo = 0;
;;!  ^^^^^^^^^^^^
(_
  (inferred_type) @statement.start
  .
  (initialized_identifier_list)
  .
  ";" @statement.end
)

;;!! const foo = 0;
;;!  ^^^^^^^^^^^^^^
(_
  (const_builtin) @statement.start
  .
  (static_final_declaration_list
    .
    (static_final_declaration)
  )
  .
  ";" @statement.end
)

(
  (program) @class.iteration @statement.iteration @namedFunction.iteration
  (#document-range! @class.iteration @statement.iteration @namedFunction.iteration)
)

(
  (program) @name.iteration @value.iteration
  (#document-range! @name.iteration @value.iteration)
)

;;!! if () {} else {}
;;!  ^^^^^^^^^^^^^^^^
(
  (if_statement
    .
    (_) @condition
  ) @ifStatement @statement @condition.domain
  (#not-parent-type? @ifStatement if_statement)
)

(
  (if_statement) @branch.iteration
  (#not-parent-type? @branch.iteration if_statement)
)

;;!! else if () {}
;;!  ^^^^^^^^^^^^^
(if_statement
  "else" @condition.domain.start
  (if_statement
    .
    (_) @condition
    consequence: (_) @condition.domain.end
  )
)

;;!! try {} catch () {} finally {}
;;!  ^^^^^^
(try_statement
  "try" @branch.start
  body: (_) @branch.end
) @branch.iteration

;;!! catch ()
;;!  ^^^^^^^^
(try_statement
  (catch_clause) @branch.start
  .
  (block) @branch.end
)

;;!! finally ()
;;!  ^^^^^^^^^^
(finally_clause) @branch

;;!! [ 0 ]
;;!  ^^^^^
[
  (list_literal)
  (list_pattern)
] @list

;;!! {"aaa": 0, "bbb": 1}
;;!  ^^^^^^^^^^^^^^^^^^^^
;;!   ^^^^^^^^^^^^^^^^^^
(set_or_map_literal
  "{" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "}" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
) @map

;;!! final {"aaa": 0, "bbb": 1} = foo;
;;!        ^^^^^^^^^^^^^^^^^^^^
;;!         ^^^^^^^^^^^^^^^^^^
(map_pattern
  "{" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "}" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
) @map

;;!! {"aaa": 0, "bbb": 1}
;;!   ^^^^^     ^^^^^
;;!          ^         ^
(pair
  key: (_) @collectionKey @value.leading.endOf
  value: (_) @value @collectionKey.trailing.startOf
) @_.domain

;;!! final {"aaa": bar, "bbb": baz} = foo;
;;!         ^^^^^     ^^^^^
;;!                ^^^         ^^^
(map_pattern
  (_) @collectionKey @value.leading.endOf @_.domain.start
  .
  ":"
  .
  (_) @value @collectionKey.trailing.startOf @_.domain.end
)

;;!! class Foo {}
;;!  ^^^^^^^^^^^^
(class_definition
  name: (_) @name
) @class @name.domain

;;!! class Foo { }
;;!             ^
(class_body
  "{" @namedFunction.iteration.start.endOf @statement.iteration.start.endOf
  "}" @namedFunction.iteration.end.startOf @statement.iteration.end.startOf
)

;;!! var foo = 0;
;;!  ^^^^^^^^^^^^
(class_body
  (declaration) @statement.start
  .
  ";" @statement.end
)

;;!! "hello world"
;;!  ^^^^^^^^^^^^^
;;!   ^^^^^^^^^^^
(string_literal
  _ @textFragment.start.endOf
  _ @textFragment.end.startOf
) @string

;;!! // Hello world
;;!  ^^^^^^^^^^^^^^
(comment) @comment @textFragment

;;!! void foo() {}
;;!  ^^^^^^^^^^^^^
;;!       ^^^
(_
  (function_signature
    name: (_) @name
  ) @namedFunction.start @statement.start @name.domain.start
  .
  (function_body) @namedFunction.end @statement.end @name.domain.end
)

;;!! void foo() {}
;;!  ^^^^^^^^^^^^^
;;!       ^^^
(_
  (method_signature
    (_
      name: (_) @name
    )
  ) @namedFunction.start @statement.start @name.domain.start
  .
  (function_body) @namedFunction.end @statement.end @name.domain.end
)

;;!! foo();
;;!  ^^^^^
;;!  ^^^
(_
  (identifier) @functionCallee.start @functionCall.start @functionCallee.domain.start
  .
  (selector)* @functionCallee.end
  .
  (selector
    (argument_part
      (type_arguments)? @functionCallee.end
      (arguments)
    )
  ) @functionCall.end @functionCallee.domain.end
)

;;!! () {}
;;!! () => 0
(function_expression) @anonymousFunction

;;!! return 0;
;;!         ^
(return_statement
  (_) @value
) @value.domain

;;!! yield 0;
;;!         ^
(yield_statement
  (_) @value
) @value.domain

;;!! throw foo;
;;!        ^^^
(expression_statement
  (throw_expression
    (_) @value
  )
) @value.domain

;;!! for (var i = 0; i < size; i++) {}
;;!                  ^^^^^^^^
(for_statement
  (for_loop_parts
    condition: (_) @condition
  )
) @condition.domain

;;!! for (final v in values) {}
;;!             ^
;;!                  ^^^^^^
(for_statement
  (for_loop_parts
    name: (_) @name
    value: (_) @value
  )
) @_.domain

;;!! while (true) {}
;;!         ^^^^
(while_statement
  (parenthesized_expression
    (_) @condition
  )
) @condition.domain

;;!! do {} while (true);
;;!               ^^^^
(do_statement
  (parenthesized_expression
    (_) @condition
  )
) @condition.domain

;;!! switch (foo) {}
;;!          ^^^
(switch_statement
  (parenthesized_expression
    (_) @value
  )
) @value.domain

;;!! case 0: break;
;;!  ^^^^^^^^^^^^^^
;;!       ^
(switch_statement_case
  (case_builtin)
  .
  (_) @condition
) @branch @condition.domain

;;!! default: break;
;;!  ^^^^^^^^^^^^^^^
(switch_statement_default) @branch

;;!! switch () { }
;;!             ^
(switch_block
  "{" @branch.iteration.start.endOf @condition.iteration.start.endOf
  "}" @branch.iteration.end.startOf @condition.iteration.end.startOf
)

;;!! true ? 0 : 1;
;;!  ^^^^
;;!         ^   ^
(conditional_expression
  .
  (_) @condition
  consequence: (_) @branch
) @condition.domain

(conditional_expression
  alternative: (_) @branch
)

;;!! true ? 0 : 1;
(conditional_expression) @branch.iteration

;;!! typedef Foo = int;
;;!          ^^^
;;!                ^^^
(type_alias
  "typedef" @name.removal.start.startOf
  (_) @name @value.leading.endOf
  (_) @value @name.removal.end.startOf
) @_.domain

(relational_operator
  [
    "<"
    ">"
    "<="
    ">="
  ]
) @disqualifyDelimiter
(shift_operator
  [
    "<<"
    ">>"
    ">>>"
  ]
) @disqualifyDelimiter
(assignment_expression
  operator: [
    "<<="
    ">>="
    ">>>="
  ] @disqualifyDelimiter
)
(function_expression_body
  "=>" @disqualifyDelimiter
)
(function_body
  "=>" @disqualifyDelimiter
)
