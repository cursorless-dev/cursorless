;; https://github.com/tree-sitter/tree-sitter-scala/blob/master/src/grammar.json

[
  (package_clause)
  (import_declaration)
  (class_definition)
  (enum_definition)
  (trait_definition)
  (var_definition)
  (val_definition)
  (val_declaration)
  (assignment_expression)
  (function_definition)
  (instance_expression)
  (call_expression)
  (match_expression)
  (return_expression)
  (while_expression)
  (do_while_expression)
  (for_expression)
  (try_expression)
  (var_declaration)
  (throw_expression)
  (type_definition)
  (infix_expression)
  (postfix_expression)

  ;; Disabled on purpose. We have a better definition of this below.
  ;; (if_expression)
] @statement

[
  (class_definition)
  (enum_definition)
  (trait_definition)
] @type

(
  (compilation_unit) @class.iteration @statement.iteration @namedFunction.iteration
  (#document-range! @class.iteration @statement.iteration @namedFunction.iteration)
)

(
  (compilation_unit) @name.iteration @value.iteration @type.iteration
  (#document-range! @name.iteration @value.iteration @type.iteration)
)

;;!! { }
;;!   ^
(_
  .
  "{" @interior.start.endOf
  "}" @interior.end.startOf
  .
)

;; level if expressions only
(
  (if_expression
    "if" @branch.start @branch.removal.start
    condition: (parenthesized_expression
      (_) @condition
    )
    consequence: (_) @branch.end @branch.removal.end
    "else"? @branch.removal.end.startOf
    alternative: (if_expression)? @branch.removal.end.startOf
  ) @ifStatement @statement @condition.domain
  (#not-parent-type? @ifStatement if_expression)
)

(
  (if_expression) @branch.iteration
  (#not-parent-type? @branch.iteration if_expression)
)

;;!! else if (true) {}
(if_expression
  "else" @branch.start @condition.domain.start
  (if_expression
    condition: (parenthesized_expression
      (_) @condition
    )
    consequence: (_) @branch.end @condition.domain.end
  )
)

;;!! else {}
(if_expression
  "else" @branch.start
  alternative: (block) @branch.end
)

[
  (string)
  (interpolated_string_expression)
] @string @textFragment

[
  (comment)
  (block_comment)
] @comment @textFragment

;; treating classes = classlike
[
  (class_definition
    name: (_) @name
  )
  (object_definition
    name: (_) @name
  )
  (trait_definition
    name: (_) @name
  )
] @class @name.domain

;;!! class Foo { }
;;!             ^
(template_body
  "{" @class.iteration.start.endOf @namedFunction.iteration.start.endOf
  "}" @class.iteration.end.startOf @namedFunction.iteration.end.startOf
)

;;!! { }
;;!   ^
(_
  "{" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  "}" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)
(_
  "{" @statement.iteration.start.endOf
  "}" @statement.iteration.end.startOf
)

;;!! foo()
;; does not count foo.size (field_expression), or foo size (postfix_expression)
(call_expression
  function: (_) @functionCallee
) @functionCall @functionCallee.domain

;;!! new Foo()
(instance_expression
  "new" @functionCallee.start
  (type_identifier) @functionCallee.end
) @functionCall @functionCallee.domain

;;!! () => {}
(lambda_expression) @anonymousFunction

;;!! () => 0
;;!        ^
(lambda_expression
  "=>"
  (_) @value
  (#not-type? @value block)
) @value.domain

;;!! def foo() {}
(function_definition
  name: (_) @name
) @namedFunction @name.domain

;;!! foo += 0
;;!  ^^^
;;!         ^
(
  (infix_expression
    left: (_) @name @value.leading.endOf
    right: (_) @value @name.trailing.startOf
  ) @_.domain
  (#not-parent-type? @_.domain val_definition)
)

;;!! foo match {}
;;!  ^^^
(match_expression
  value: (_) @value
  (case_block
    "{" @branch.iteration.start.endOf @condition.iteration.start.endOf
    "}" @branch.iteration.end.startOf @condition.iteration.end.startOf
  )
) @value.domain

;;!! for (v <- values) {}
(for_expression
  (enumerators
    (enumerator
      [
        (identifier) @name
        (typed_pattern
          pattern: (_) @name @type.leading.endOf
          type: (_) @type
        )
      ]
      "<-"
      (_) @value
    )
  )
) @_.domain

(
  (_
    name: (_) @name
  ) @name.domain
  (#not-type? @name.domain simple_enum_case full_enum_case var_declaration val_declaration type_definition)
)

;;!! var foo: Int
;;!      ^^^
(var_declaration
  name: (_) @name
) @name.domain @name.removal

;;!! val foo: Int
;;!      ^^^
(val_declaration
  name: (_) @name
) @name.domain @name.removal

;;!! var foo = 0
;;!      ^^^
(var_definition
  pattern: (_) @name
  value: (_) @name.removal.end.startOf
) @name.domain @name.removal.start.startOf

;;!! val foo = 0
;;!      ^^^
(val_definition
  pattern: (_) @name
  value: (_) @name.removal.end.startOf
) @name.domain @name.removal.start.startOf

(enum_case_definitions
  [
    ;;!! case Bar
    (simple_enum_case
      name: (_) @name
    )
    ;;!! case Baz(x: Int)
    (full_enum_case
      name: (_) @name @functionCallee
      class_parameters: (_)
    ) @functionCall @functionCallee.domain
  ]
) @name.domain

;;!! foo = 0
;;!  ^^^
;;!        ^
(assignment_expression
  left: (_) @name @value.leading.endOf
  right: (_) @value @name.trailing.startOf
) @_.domain

(
  (_
    condition: (parenthesized_expression
      (_) @condition
    )
  ) @condition.domain
  (#not-type? @condition.domain if_expression)
)

;;!! type Vector = (Int, Int)
;;!                ^^^^^^^^^^
(type_definition
  name: (_) @name @value.leading.endOf
  type: (_) @value @name.removal.end.startOf
) @type @name.removal.start.startOf @_.domain

;;!! class Example(foo: String = "foo") {}
;;!                              ^^^^^
(_
  (_) @value.leading.endOf
  .
  default_value: (_) @value
) @value.domain

;;!! val bar = "bar"
;;!            ^^^^^
(_
  (_) @value.leading.endOf
  .
  value: (_) @value
) @value.domain

;;!! case e: Exception => 0
;;!! case e => 0
(catch_clause
  (case_block
    (case_clause
      pattern: [
        (identifier) @name
        (typed_pattern
          pattern: (identifier) @name @type.leading.endOf
          type: (_) @type
        )
      ] @argumentOrParameter @_.domain
    )
  )
)

;;!! def str(bar: String)
;;!               ^^^^^^
;;!! val foo: String = "foo"
;;!           ^^^^^^
(
  (_
    (_) @type.leading.endOf
    .
    type: (_) @type
  ) @type.domain
  (#not-type? @type.domain type_definition typed_pattern)
)

;;!! def str(): Int {}
;;!             ^^^
(function_definition
  (parameters) @type.leading.endOf
  return_type: (_) @type
) @type.domain

;;!! class Foo { def bar(): Int {} }
;;!                         ^^^
(function_declaration
  parameters: (_) @type.leading.endOf
  return_type: (_
    base: (_) @type
  )
) @type.domain

;;!! return 0
;;!         ^
(return_expression
  (_) @value
) @value.domain

;;!! throw foo
;;!        ^^^
(throw_expression
  (_) @value
) @value.domain

;;!! case 0 => 0
;;!  ^^^^^^^^^^^
(match_expression
  (case_block
    (case_clause) @branch
  )
  (#trim-end! @branch)
)

;;!! case 0 => 0
;;!       ^
(match_expression
  (case_block
    (case_clause
      pattern: (_) @condition
    ) @condition.domain
  )
  (#not-type? @condition typed_pattern)
  (#trim-end! @condition.domain)
)

;;!! case foo: Int => 0
;;!       ^^^
;;!            ^^^
(match_expression
  (case_block
    (case_clause
      pattern: (typed_pattern
        pattern: (_) @condition @type.leading.endOf
        type: (_) @type
      ) @type.domain
    ) @condition.domain
  )
  (#not-type? @condition typed_pattern)
  (#trim-end! @condition.domain)
)

;;!! case 0 => 0
;;!           ^^
(match_expression
  (case_block
    (case_clause
      "=>" @interior.start.endOf
      body: (_) @interior.end.endOf
    )
  )
  (#not-type? @interior.end.endOf block)
)

;;!! try {}
(try_expression
  "try" @branch.start
  body: (_) @branch.end
) @branch.iteration

;;!! catch {}
(catch_clause) @branch

;;!! catch {}
(finally_clause) @branch

;;!! var a, b, c = 0
;;!      ^^^^^^^
(_
  (identifiers) @collectionItem.iteration
) @collectionItem.iteration.domain

;;!! var a, b, c = 0
;;!      ^  ^  ^
(
  (identifiers
    (_)? @_.leading.endOf
    .
    (_) @collectionItem
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @collectionItem @_dummy ", " ",\n")
)

;;!! var foo: Bar[Int, Int]
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

;;!! var foo: Bar[Int, Int]
;;!               ^^^^^^^^
(type_arguments
  "[" @type.iteration.start.endOf
  "]" @type.iteration.end.startOf
)

;;!! class Foo(aaa: Int, bbb: Int) {}
;;!            ^^^^^^^^  ^^^^^^^^
(
  (class_parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! def foo(aaa: Int, bbb: Int) = x
;;!          ^^^^^^^^  ^^^^^^^^
(
  (parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! (aaa: Int, bbb: Int) => {}
;;!   ^^^^^^^^  ^^^^^^^^
(lambda_expression
  (bindings
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa, bbb)
;;!      ^^^  ^^^
(
  (arguments
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
(_
  (class_parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

(class_parameters
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

;;!! def foo(aaa: Int, bbb: Int) {}
;;!          ^^^^^^^^^^^^^^^^^^
(_
  (parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

(parameters
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

;;!! (aaa: Int, bbb: Int) => {}
;;!   ^^^^^^^^^^^^^^^^^^
(lambda_expression
  (bindings
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

(bindings
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

;;!! foo(aaa, bbb)
;;!      ^^^^^^^^
(_
  (arguments
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

(arguments
  "(" @name.iteration.start.endOf @value.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf
)

(_
  operator: (operator_identifier) @disqualifyDelimiter
)
(enumerator
  "<-" @disqualifyDelimiter
)
(view_bound
  "<%" @disqualifyDelimiter
)
(upper_bound
  "<:" @disqualifyDelimiter
)
(lower_bound
  ">:" @disqualifyDelimiter
)
(lambda_expression
  "=>" @disqualifyDelimiter
)
(function_type
  "=>" @disqualifyDelimiter
)
(case_clause
  "=>" @disqualifyDelimiter
)
