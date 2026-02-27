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

;;!! if () {}
;;!  ^^^^^^^^
(
  (if_statement) @ifStatement @statement
  (#not-parent-type? @ifStatement if_statement)
)

;;!! [ 0 ]
;;!  ^^^^^
[
  (list_literal)
  (list_pattern)
] @list

;;!! { value: 0 }
;;!  ^^^^^^^^^^^^
[
  (set_or_map_literal)
  (map_pattern)
] @map

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
