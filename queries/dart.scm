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
  ) @namedFunction.start @name.domain.start
  .
  (function_body) @namedFunction.end @name.domain.end
)

;;!! void foo() {}
;;!  ^^^^^^^^^^^^^
;;!       ^^^
(_
  (method_signature
    (_
      name: (_) @name
    )
  ) @namedFunction.start @name.domain.start
  .
  (function_body) @namedFunction.end @name.domain.end
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

;;!! class Foo { }
;;!             ^
(class_body
  "{" @namedFunction.iteration.start.endOf
  "}" @namedFunction.iteration.end.startOf
)
