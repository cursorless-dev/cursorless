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

(
  (program) @class.iteration @statement.iteration @namedFunction.iteration
  (#document-range! @class.iteration @statement.iteration @namedFunction.iteration)
)

(
  (program) @name.iteration @value.iteration
  (#document-range! @name.iteration @value.iteration)
)

;;!! { }
;;!   ^
(_
  .
  "{" @interior.start.endOf
  "}" @interior.end.startOf
  .
)

;;!! var foo = 0;
;;!  ^^^^^^^^^^^^
;;!      ^^^
;;!            ^
(_
  (inferred_type) @statement.start @_.domain.start @name.removal.start.startOf
  .
  (initialized_identifier_list
    (initialized_identifier
      (_) @name @value.leading.endOf
      "="
      .
      (_) @value.start @name.removal.end.startOf
      (_)? @value.end
      .
    )
  )
  .
  ";" @statement.end @_.domain.end
)

;;!! var foo;
;;!  ^^^^^^^^
;;!      ^^^
(_
  (inferred_type) @statement.start @name.removal.start @name.domain.start
  .
  (initialized_identifier_list
    (initialized_identifier
      .
      (_) @name
      .
    )
  )
  .
  ";" @statement.end @name.removal.end @name.domain.end
)

;;!! var foo, bar;
;;!      ^^^^^^^^
(_
  (inferred_type) @collectionItem.iteration.domain.start
  .
  (initialized_identifier_list) @collectionItem.iteration
  .
  ";" @collectionItem.iteration.domain.end
)

;;!! var foo, bar;
;;!      ^^^  ^^^
(
  (initialized_identifier_list
    (_)? @_.leading.endOf
    .
    (_) @collectionItem
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @collectionItem comment)
  (#single-or-multi-line-delimiter! @collectionItem @_dummy ", " ",\n")
)

;;!! const foo = 0;
;;!  ^^^^^^^^^^^^^^
;;!        ^^^
;;!              ^
(_
  (const_builtin) @statement.start @_.domain.start @name.removal.start.startOf
  .
  (static_final_declaration_list
    (static_final_declaration
      (_) @name @value.leading.endOf
      (_) @value @name.removal.end.startOf
    )
  )
  .
  ";" @statement.end @_.domain.end
)

;;!! foo = 0;
;;!  ^^^
;;!        ^
(expression_statement
  (assignment_expression
    left: (_) @name @value.leading.endOf
    right: (_) @value @name.trailing.startOf
  )
) @_.domain

;;!! if () {} else {}
;;!  ^^^^^^^^^^^^^^^^
;;!  ^^^^^^^^
(
  (if_statement
    "if" @branch.start @branch.removal.start
    .
    (_) @condition
    consequence: (_) @branch.end @branch.removal.end
    "else"? @branch.removal.end.startOf
    alternative: (if_statement)? @branch.removal.end.startOf
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
  "else" @condition.domain.start @branch.start @branch.removal.start
  (if_statement
    .
    (_) @condition
    consequence: (_) @condition.domain.end @branch.end @branch.removal.end
    "else"? @branch.removal.end.startOf
  )
)

;;!! else {}
;;!  ^^^^^^^
(if_statement
  "else" @branch.start
  alternative: (block) @branch.end
)

;;!! try {} catch () {} finally {}
;;!  ^^^^^^
(try_statement
  "try" @branch.start
  body: (_) @branch.end
) @branch.iteration

;;!! catch (e, s) {}
;;!  ^^^^^^^^^^^^^^^
;;!         ^^^^
(try_statement
  (catch_clause
    "catch" @branch.start @argumentList.domain.start @argumentOrParameter.iteration.domain.start
    (catch_parameters
      "(" @argumentList.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.end.startOf @argumentOrParameter.iteration.end.startOf
    )
  )
  .
  (block) @branch.end @argumentList.domain.end @argumentOrParameter.iteration.domain.end
)

;;!! catch (e, s) {}
;;!         ^  ^
(
  (catch_parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter comment)
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
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

(class_body
  "{" @name.iteration.start.endOf @value.iteration.start.endOf
  "}" @name.iteration.end.startOf @value.iteration.end.startOf
)

;;!! var foo = 0;
;;!  ^^^^^^^^^^^^
;;!      ^^^
;;!            ^
(class_body
  (declaration
    (inferred_type) @statement.start @name.removal.start.startOf @_.domain.start
    (initialized_identifier_list
      (initialized_identifier
        (_) @name @value.leading.endOf
        (_) @value @name.removal.end.startOf
      )
    )
  )
  .
  ";" @statement.end @_.domain.end
)

;;!! var foo;
;;!  ^^^^^^^^
;;!      ^^^
(class_body
  (declaration
    (inferred_type) @statement.start @name.removal.start @name.domain.start
    (initialized_identifier_list
      (initialized_identifier
        .
        (_) @name
        .
      )
    )
  )
  .
  ";" @statement.end @name.removal.end @name.domain.end
)

;;!! enum Foo {}
;;!       ^^^
(enum_declaration
  name: (_) @name
) @name.domain

;;!! enum Foo { }
;;!            ^
(enum_body
  "{" @name.iteration.start.endOf
  "}" @name.iteration.end.startOf
)

;;!! bar,
;;!  ^^^
(
  (enum_constant
    name: (_) @name
  ) @name.domain
  (#not-eq? @name.domain "")
)

;;!! bar(),
;;!  ^^^^^
;;!  ^^^
(enum_constant
  name: (_) @functionCallee
  (argument_part)
) @functionCall @functionCallee.domain

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

;;!! void foo(aaa, bbb) {}
;;!           ^^^^^^^^
(_
  (function_signature
    (formal_parameter_list
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  ) @argumentList.domain.start @argumentOrParameter.iteration.domain.start
  .
  (function_body) @argumentList.domain.end @argumentOrParameter.iteration.domain.end
)

;;!! void foo(aaa, bbb) {}
;;!           ^^^^^^^^
(_
  (method_signature
    (_
      (formal_parameter_list
        "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
        ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
      ) @argumentList
      (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
      (#child-range! @argumentList 1 -2)
    ) @argumentList.domain.start @argumentOrParameter.iteration.domain.start
  )
  .
  (function_body) @argumentList.domain.end @argumentOrParameter.iteration.domain.end
)

;;!! void foo(aaa, bbb) {}
;;!           ^^^  ^^^
(
  (formal_parameter_list
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter comment)
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! void foo(aaa, bbb) {}
;;!           ^^^^^^^^
(formal_parameter_list
  "(" @name.iteration.start.endOf @value.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf
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

;;!! foo(aaa, bbb)
;;!      ^^^^^^^^
(_
  (identifier) @argumentList.domain.start @argumentOrParameter.iteration.domain.start
  .
  (selector)*
  .
  (selector
    (argument_part
      (arguments
        "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
        ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
      ) @argumentList
    )
  ) @argumentList.domain.end @argumentOrParameter.iteration.domain.end
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
)

;;!! foo(aaa, bbb);
;;!      ^^^  ^^^
(
  (arguments
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter comment)
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! () {}
;;!! () => 0
(function_expression
  (function_expression_body
    [
      (block)
      (
        "=>"
        (_) @value
      )
    ]
  )
) @anonymousFunction @value.domain

;;!! (aaa, bbb) => {}
;;!   ^^^^^^^^
(function_expression
  (formal_parameter_list
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

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

;;!! case 0: break;
;;!         ^^^^^^^
(switch_statement_case
  ":" @interior.start.endOf
  .
  (_) @interior.end.endOf @_dummy
  (_)? @interior.end.endOf
  .
  (#not-type? @_dummy block)
)

;;!! default: break;
;;!  ^^^^^^^^^^^^^^^
(switch_statement_default) @branch

;;!! default: break;
;;!          ^^^^^^^
(switch_statement_default
  ":" @interior.start.endOf
  .
  (_) @interior.end.endOf @_dummy
  (_)? @interior.end.endOf
  .
  (#not-type? @_dummy block)
)

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
