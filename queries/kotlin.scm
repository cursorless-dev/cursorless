;; https://github.com/fwcd/tree-sitter-kotlin/blob/main/src/grammar.json

[
  (class_declaration)
  (object_declaration)
  (companion_object)
  (function_declaration)
  (secondary_constructor)
  (anonymous_initializer)
  (property_declaration)
  (assignment)
  (for_statement)
  (while_statement)
  (do_while_statement)
  (jump_expression)
  (when_expression)
  (try_expression)
  (import_list)
  (package_header)
  (getter)
  (setter)
  (prefix_expression)
  (postfix_expression)
  (type_alias)

  ;; Disabled on purpose. We have a better definition of this below.
  ;; (if_expression)
] @statement

(control_structure_body
  (call_expression) @statement
)
(source_file
  (call_expression) @statement
)

;; Entire document, including leading and trailing whitespace
(
  (source_file) @class.iteration @statement.iteration @namedFunction.iteration
  (#document-range! @class.iteration @statement.iteration @namedFunction.iteration)
)
(
  (source_file) @name.iteration @value.iteration @type.iteration
  (#document-range! @name.iteration @value.iteration @type.iteration)
)

;;!! { }
;;!   ^
(
  (_
    "{" @statement.iteration.start.endOf @namedFunction.iteration.start.endOf
    "}" @statement.iteration.end.startOf @namedFunction.iteration.end.startOf
  ) @_dummy
  (#not-type? @_dummy lambda_literal)
)
(
  (_
    "{" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
    "}" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
  ) @_dummy
  (#not-type? @_dummy lambda_literal)
)

;;!! { }
;;!   ^
(_
  "{" @interior.start.endOf
  "}" @interior.end.startOf
)

;;!! fun foo(): Int {}
;;!      ^^^
;;!             ^^^
(function_declaration
  (simple_identifier) @name
  (function_value_parameters) @type.leading.endOf
  (type_modifiers)? @type.start
  (user_type)? @type.end
) @namedFunction @_.domain

;;!! fun foo(): Int = 0
;;!                   ^
(function_declaration
  (_) @value.leading.start.endOf
  .
  (function_body
    "="
    (_) @value
  )
) @value.domain

;;!! constructor() {}
(secondary_constructor
  "constructor" @name
) @namedFunction @name.domain

;;!! fun() {}
(anonymous_function
  (function_value_parameters) @type.leading.endOf
  (user_type)? @type
) @anonymousFunction @type.domain

;;!! {x -> 0}
(lambda_literal
  (statements)? @value
) @anonymousFunction @value.domain

;;!! "Hello world"
(string_literal
  (string_content) @textFragment
) @string

[
  ;;!! // Hello world
  (line_comment)
  ;;!! /* Hello world */
  (multiline_comment)
] @comment @textFragment

;; Top level if statement
(
  (_
    (if_expression) @ifStatement @statement @branch.iteration
  ) @_dummy
  (#not-parent-type? @_dummy if_expression)
)

(
  (_
    (if_expression
      "if" @branch.start @branch.removal.start.startOf
      condition: (_) @condition
      consequence: (_)? @branch.end @branch.removal.end.endOf
      "else"? @branch.removal.end.startOf
      alternative: (control_structure_body
        .
        (if_expression) @branch.removal.end.startOf
      )?
    ) @condition.domain
  ) @_dummy
  (#not-parent-type? @_dummy if_expression)
)

;;!! else if (true) {}
(if_expression
  "else" @condition.domain.start @branch.start
  (control_structure_body
    (if_expression
      condition: (_) @condition
      consequence: (_) @condition.domain.end @branch.end
    )
  )
)

;;!! else {}
(if_expression
  "else" @branch.start
  (control_structure_body
    "{"
  ) @branch.end
)

;;!! if (true) 0 else 1
;;!              ^^^^^^
(if_expression
  "else" @branch.start
  (control_structure_body
    .
    (_) @_dummy
  ) @branch.end
  (#not-type? @_dummy if_expression)
)

;;!! try {} catch {}
(try_expression
  "try" @branch.start
  "}" @branch.end
) @branch.iteration

;;!! catch (e: Exception) {}
;;!         ^^^^^^^^^^^^
(catch_block
  (simple_identifier) @argumentOrParameter.start
  ":"
  (user_type) @argumentOrParameter.end
) @branch

;;!! catch (e: Exception) {}
;;!         ^
(catch_block
  (simple_identifier) @name @name.domain.start
  ":"
  (user_type) @name.domain.end
)

;;!! catch (e: Exception) {}
;;!            ^^^^^^^^^
(catch_block
  (simple_identifier) @type.domain.start @type.leading.endOf
  ":"
  (user_type) @type @type.domain.end
)

;;!! finally {}
(finally_block) @branch

;;!! when (foo) { }
;;!              ^
(when_expression
  "{" @branch.iteration.start.endOf @condition.iteration.start.endOf
  "}" @branch.iteration.end.startOf @condition.iteration.end.startOf
)

;;!! when (foo) {}
;;!        ^^^
(when_expression
  (when_subject
    .
    (_) @value
    .
  )
) @value.domain

;;!! when (foo) {}
;;!        ^^^
(when_expression
  (when_subject
    (variable_declaration
      (simple_identifier) @name
      (user_type)? @type
    ) @value.leading.endOf
    "="
    (_) @value
  )
) @_.domain

;;!! 0 -> break
(when_entry) @branch

;;!! 0 -> break
;;!  ^
(when_entry
  .
  (when_condition) @condition.start
  (when_condition)? @condition.end
  .
  "->"
) @condition.domain

;;!! 0 -> break
;;!      ^^^^^^
(when_entry
  "->" @interior.start.endOf
  (control_structure_body
    .
    (_)
  ) @interior.end.endOf
) @interior.domain

;;!! while (true) {}
;;!         ^^^^
(while_statement
  "while"
  "("
  (_) @condition
  ")"
) @condition.domain

;;!! do {} while (true)
;;!               ^^^^
(do_while_statement
  "("
  (_) @condition
  ")"
) @condition.domain

;;!! class Foo {}
(class_declaration
  (type_identifier) @name
) @class @type @name.domain

;;!! object Foo {}
(object_declaration
  (type_identifier) @name
) @class @type @name.domain

;;!! companion object Foo {}
(companion_object
  (type_identifier) @name
) @class @type @name.domain

;;!! val foo: Int = 0
;;!      ^^^
;;!           ^^^
;;!                 ^
(property_declaration
  [
    (variable_declaration
      (simple_identifier) @name @type.leading.endOf
      (type_modifiers)? @type.start
      (_)? @type.end
      .
    )
    (multi_variable_declaration) @name
  ] @value.leading.endOf @name.removal.end.endOf
  (_)? @value @name.removal.end.startOf
) @_.domain @name.removal.start.startOf

;;!! foo = 0
;;!  ^^^
;;!        ^
(assignment
  (directly_assignable_expression) @name @value.leading.endOf
  (_) @value @name.trailing.startOf
  .
) @_.domain

;;!! typealias Foo = Bar
;;!            ^^^
;;!                  ^^^
(type_alias
  (type_identifier) @name @value.leading.endOf
  .
  "="
  (_) @value @name.removal.end.startOf
) @type @name.removal.start.startOf @_.domain

;;!! typealias Foo<T> = Bar
;;!            ^^^^^^
;;!                     ^^^
(type_alias
  (type_identifier) @name.start
  (type_parameters) @name.end @value.leading.endOf
  "="
  (_) @value @name.removal.end.startOf
) @type @name.removal.start.startOf @_.domain

;;!! for (v: Int in values) {}
;;!       ^
;;!          ^^^
(for_statement
  [
    (variable_declaration
      (simple_identifier) @name @type.leading.endOf
      (user_type)? @type
    )
    (multi_variable_declaration) @name
  ]
  "in"
  .
  (_) @value
) @_.domain

;;!! return 0
;;!         ^
(jump_expression
  [
    "return"
    "throw"
  ]
  (_) @value
) @value.domain

;;!! aaa to 0
;;!  ^^^
;;!         ^
(infix_expression
  (_) @collectionKey @value.leading.endOf
  (simple_identifier) @_dummy
  (_) @value @collectionKey.trailing.startOf
  (#eq? @_dummy to)
) @_.domain

;;!! mapOf( )
;;!        ^
(call_expression
  (simple_identifier) @_dummy
  (call_suffix
    (value_arguments
      "(" @collectionKey.iteration.start.endOf
      ")" @collectionKey.iteration.end.startOf
    )
  )
  (#eq? @_dummy mapOf)
)

;;!! foo<T>()
;;!  ^^^^^^^^
;;!  ^^^^^^
(call_expression
  [
    (simple_identifier)
    (navigation_expression)
  ] @functionCallee.start
  (call_suffix
    (type_arguments) @functionCallee.end
  )?
) @functionCall @functionCallee.domain

;;!! fun foo(aaa: Int, bbb: Int) {}
;;!          ^^^^^^^^^^^^^^^^^^
(_
  (function_value_parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

(function_value_parameters
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

;;!! foo: Int
;;!! vararg foo: Int
(
  (function_value_parameters
    (_)? @_.leading.endOf
    .
    [
      ","
      "("
    ]
    .
    [
      (line_comment)
      (multiline_comment)
    ] *
    .
    (parameter_modifiers)? @argumentOrParameter.start
    .
    (parameter) @argumentOrParameter.end
    .
    [
      (line_comment)
      (multiline_comment)
    ] *
    .
    [
      ","
      ")"
    ]
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter.end @_dummy ", " ",\n")
)

(
  (function_value_parameters
    (_)? @_dummy
    .
    [
      ","
      "("
    ]
    .
    (parameter_modifiers)? @_.domain.start
    .
    (parameter
      (simple_identifier) @name @type.leading.endOf
      (user_type) @type
    ) @_.domain.end
    .
    [
      ","
      ")"
    ]
  )
)

;; !! foo: Int = 0
;; !! vararg foo: Int = 0
(
  (function_value_parameters
    (_)? @_.leading.endOf
    .
    [
      ","
      "("
    ]
    .
    [
      (line_comment)
      (multiline_comment)
    ] *
    .
    (parameter_modifiers)? @argumentOrParameter.start.startOf
    .
    (parameter) @argumentOrParameter.start
    .
    (_) @argumentOrParameter.end
    (#not-type? @argumentOrParameter.end parameter parameter_modifiers)
    .
    [
      (line_comment)
      (multiline_comment)
    ] *
    .
    [
      ","
      ")"
    ]
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter.end @_dummy ", " ",\n")
)

(function_value_parameters
  (_)? @_dummy
  .
  [
    ","
    "("
  ]
  .
  (parameter_modifiers)? @_.domain.start
  .
  (parameter
    (simple_identifier) @name @type.leading.endOf
    (user_type) @type
  ) @_.domain.start @value.leading.endOf
  .
  (_) @value @_.domain.end
  (#not-type? @_.domain.end parameter parameter_modifiers)
  .
  [
    ","
    ")"
  ]
)

;;!! foo() { -> }
;;!        ^^^^^^
(call_suffix
  (annotated_lambda) @argumentOrParameter
)

;;!! { aaa, bbb -> }
;;!    ^^^^^^^^
(lambda_literal
  (lambda_parameters) @argumentList @argumentOrParameter.iteration
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! { aaa, bbb -> }
;;!    ^^^^^^^^
(lambda_parameters) @name.iteration @type.iteration

;;!! { -> }
(lambda_literal
  "{" @argumentList.start.endOf @argumentList.removal.start.endOf
  .
  [
    (statements)
    "->"
    "}"
  ]
) @argumentList.domain

;;!! { aaa: Int, bbb: Int -> }
;;!    ^^^       ^^^
;;!         ^^^       ^^^
(lambda_parameters
  (variable_declaration
    (simple_identifier) @name @type.leading.endOf
    (user_type)? @type
  ) @_.domain
)

(
  (lambda_parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! class Foo(aaa: Int, bbb: Int) {}
;;!            ^^^^^^^^^^^^^^^^^^
(class_declaration
  (primary_constructor
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

(primary_constructor
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

(
  (primary_constructor
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa, bbb)
;;!      ^^^^^^^^
;;!! class Foo: Bar(aaa, bbb)
;;!                 ^^^^^^^^
(_
  (_
    (value_arguments
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @argumentList.domain @argumentOrParameter.iteration.domain

(value_arguments
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

(
  (value_arguments
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa = 0)
;;!      ^^^
;;!            ^
(value_argument
  (simple_identifier) @name @value.leading.endOf
  "="
  (_) @value @name.trailing.startOf
) @_.domain

;;!! var foo: Map<Int, Int>
;;!               ^^^^^^^^
(type_arguments
  "<" @type.iteration.start.endOf
  ">" @type.iteration.end.startOf
)

;;!! var foo: Map<Int, Int>
;;!               ^^^  ^^^
(
  (type_arguments
    (_)? @_.leading.endOf
    .
    (_) @type
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @type @_dummy ", " ",\n")
)

;;!! class Foo(aaa: Int = 0) {}
;;!            ^^^
;;!                 ^^^
;;!                       ^
(class_parameter
  (simple_identifier) @name @type.leading.endOf
  (user_type) @type @value.leading.endOf
  (
    "="
    (_) @value
  )?
) @_.domain

;;!! get(): Int {}
(getter
  ")" @type.leading.endOf
  (user_type) @type
) @namedFunction @type.domain

;;!! set(aaa: Int) {}
;;!      ^^^^^^^^
(setter
  (parameter_with_optional_type
    (simple_identifier) @name @type.leading.endOf
    (user_type) @type
  ) @argumentOrParameter @_.domain
)

;;!! set(aaa: Int): Unit {}
;;!      ^^^^^^^^
;;!                 ^^^^
;; There is only one parameter allowed, but we treat it as iterable for consistency.
(setter
  (parameter_with_optional_type) @argumentOrParameter.iteration
  ")" @type.leading.endOf
  (user_type)? @type
) @namedFunction @type.domain @argumentOrParameter.iteration.domain

;;!! BAR,
(enum_entry
  (simple_identifier) @name
) @name.domain

;;!! BAR()
(enum_entry
  (simple_identifier) @functionCallee
  (value_arguments)
) @functionCall @functionCallee.domain

;;!! class Foo: Bar()
;;!             ^^^^^
(constructor_invocation
  (user_type) @functionCallee
) @functionCall @functionCallee.domain

;;!! constructor(): this()
;;!                 ^^^^^^
(constructor_delegation_call
  [
    "this"
    "super"
  ] @functionCallee
) @functionCall @functionCallee.domain

(comparison_expression
  [
    "<"
    ">"
    "<="
    ">="
  ] @disqualifyDelimiter
)
(lambda_literal
  "->" @disqualifyDelimiter
)
(when_entry
  "->" @disqualifyDelimiter
)
