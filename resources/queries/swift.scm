;; https://github.com/alex-pinkus/tree-sitter-swift/blob/with-generated-files/src/grammar.json

[
  (class_declaration)
  (protocol_declaration)
  (property_declaration)
  (function_declaration)
  (protocol_property_declaration)
  (protocol_function_declaration)
  (init_declaration)
  (import_declaration)
  (typealias_declaration)
  (for_statement)
  (do_statement)
  (while_statement)
  (repeat_while_statement)
  (switch_statement)
  (control_transfer_statement)
  (assignment)
  (call_expression)

  ;; Disabled on purpose. We have a better definition of these below.
  ;; (if_statement)
] @statement

;; document-wide
(
  (source_file) @statementNameValueType.iteration @class.iteration @namedFunction.iteration
  (#document-range! @statementNameValueType.iteration @class.iteration @namedFunction.iteration)
)

;;!! { }
;;!   ^
(
  (_
    "{" @statementNameValueType.iteration.start.endOf @class.iteration.start.endOf @namedFunction.iteration.start.endOf
    "}" @statementNameValueType.iteration.end.startOf @class.iteration.end.startOf @namedFunction.iteration.end.startOf
  ) @_dummy
  (#not-type? @_dummy if_statement)
)

(
  (_
    "{" @interior.start.endOf
    "}" @interior.end.startOf
  ) @_dummy
  (#not-type? @_dummy if_statement)
)

;;!! // Hello world
;;!  ^^^^^^^^^^^^^^
(comment) @comment @textFragment

;;!! /* Hello world */
;;!  ^^^^^^^^^^^^^^^^^
(multiline_comment) @comment @textFragment

;;!! "Hello world"
;;!  ^^^^^^^^^^^^^
;;!   ^^^^^^^^^^^
(line_string_literal
  text: (_) @textFragment
) @string

;;!! #"Hello world"#
;;!  ^^^^^^^^^^^^^^^
;;!    ^^^^^^^^^^^
(raw_string_literal
  (_) @textFragment
  (#character-range! @textFragment 2 -2)
) @string

;;!! """Hello world"""
;;!  ^^^^^^^^^^^^^^^^^
;;!     ^^^^^^^^^^^
(multi_line_string_literal
  text: (_) @textFragment
) @string

;;!! struct Foo {}
;;!         ^^^
(class_declaration
  name: (_) @name
  (class_body)
) @class @type @name.domain

;;!! enum Foo {}
;;!       ^^^
(class_declaration
  name: (_) @name
  (enum_class_body)
) @type @name.domain

;;!! case foo = 0
;;!       ^^^
;;!             ^
(enum_entry
  name: (_) @name @value.leading.endOf
  raw_value: (_) @value
) @_.domain

;;!! protocol Foo {}
;;!           ^^^
(protocol_declaration
  name: (_) @name
) @type @name.domain

;;!! for v: Int in values {}
;;!      ^
;;!         ^^^
;;!                ^^^^^^
(for_statement
  item: (_) @name
  (type_annotation
    ":" @type.leading
    .
    _ @type
  )?
  collection: (_) @value
) @_.domain

;;!! if true {} else if false {} else {}
(
  (if_statement) @ifStatement @statement @branch.iteration
  (#not-parent-type? @ifStatement if_statement)
)

(
  (if_statement
    condition: (_) @condition
  ) @condition.domain
  (#not-parent-type? @condition.domain if_statement)
)

;;!! if true {}
(
  (if_statement
    "{" @interior.start.endOf
    "}" @branch.end.endOf @interior.end.startOf
  ) @branch.start.startOf
  (#not-parent-type? @branch.start.startOf if_statement)
  (#not-child-type? @branch.start.startOf else)
)

;;!! if true { }
;;!           ^
(
  (if_statement
    "{" @statementNameValueType.iteration.start.endOf @class.iteration.start.endOf @namedFunction.iteration.start.endOf
    "}" @statementNameValueType.iteration.end.startOf @class.iteration.end.startOf @namedFunction.iteration.end.startOf
  ) @_dummy
  (#not-child-type? @_dummy else)
)

;;!! if true {} else {}
(
  (if_statement
    "{" @interior.start.endOf
    "}" @branch.end.endOf @interior.end.startOf
    (else) @branch.removal.end.startOf
    (if_statement)? @branch.removal.end.startOf
  ) @branch.start.startOf @branch.removal.start.startOf
  (#not-parent-type? @branch.start.startOf if_statement)
)

;;!! if true { } else {}
;;!           ^
(
  (if_statement
    "{" @statementNameValueType.iteration.start.endOf @class.iteration.start.endOf @namedFunction.iteration.start.endOf
    "}" @statementNameValueType.iteration.end.startOf @class.iteration.end.startOf @namedFunction.iteration.end.startOf
    (else)
  )
)

;;!! else if true {} else {}
(if_statement
  (else) @branch.start @condition.domain.start
  (if_statement
    condition: (_) @condition
    "{" @interior.start.endOf
    "}" @branch.end @interior.end.startOf @condition.domain.end
    .
    (else)
  )
)

;;!! else if true {}
(
  (if_statement
    (else) @branch.start @condition.domain.start
    (if_statement
      condition: (_) @condition
      "{" @interior.start.endOf
      "}" @branch.end @interior.end.startOf @condition.domain.end
    ) @_dummy
  )
  (#not-child-type? @_dummy else)
)

;;!! else {}
(
  (else) @branch.start
  "{" @interior.start.endOf
  "}" @branch.end @interior.end.startOf
)

;;!! else { }
;;!        ^
(
  (else)
  "{" @statementNameValueType.iteration.start.endOf @class.iteration.start.endOf @namedFunction.iteration.start.endOf
  "}" @statementNameValueType.iteration.end.startOf @class.iteration.end.startOf @namedFunction.iteration.end.startOf
)

;;!! var foo: Int = 0
;;!      ^^^
;;!           ^^^
;;!                 ^
(property_declaration
  name: (_) @name @type.leading.endOf
  (type_annotation
    (_) @type
  ) @value.leading.endOf
  value: (_)? @value
) @_.domain

;;!! var foo = 0
;;!      ^^^
;;!            ^
(
  (property_declaration
    name: (_) @name @value.leading.endOf
    value: (_)? @value
  ) @_.domain
  (#not-child-type? @_.domain type_annotation)
)

;;!! let foo: Int { get set}
;;!      ^^^
;;!           ^^^
(protocol_property_declaration
  name: (pattern
    bound_identifier: (_) @name
  )
  (type_annotation
    ":" @type.leading
    (_) @type
  )
) @_.domain

;;!! foo = 0
;;!  ^^^
;;!        ^
(assignment
  target: (_) @name @value.leading.endOf
  result: (_) @value
) @_.domain

;;!! { () -> Int in 0 }
;;!          ^^^
(lambda_literal
  (lambda_function_type
    ")" @type.leading.endOf
    name: (_)? @type
  )
) @anonymousFunction

;;!! { () -> Int in 0 }
;;!                 ^
(lambda_literal
  (statements) @interior
)

;;!! { () -> Int in 0 }
;;!                 ^
(lambda_literal
  (statements
    .
    (_) @value
    .
  )
  (#not-type? @value control_transfer_statement)
) @value.domain

;;!! do {} catch {}
;;!  ^^^^^
(do_statement
  "do" @branch.start
  "}" @branch.end
  (catch_block)
) @branch.iteration

;;!! do {} catch {}
;;!        ^^^^^^^^
(catch_block) @branch

;;!! do {} catch let e as Error {}
;;!              ^^^^^^^^^^^^^^
;;!                  ^
;;!                       ^^^^^
(catch_block
  (pattern
    (pattern
      bound_identifier: (_) @name
    )
    name: (_) @type
  ) @argumentOrParameter @_.domain
)

;;!! do {} catch let e {}
;;!              ^^^^^
;;!                  ^
(catch_block
  (pattern
    bound_identifier: (_) @name
  ) @argumentOrParameter @name.domain
)

;;!! true ? 0 : 1
;;!  ^^^^
;;!         ^
(ternary_expression
  condition: (_) @condition
  if_true: (_) @branch
) @condition.domain @branch.iteration

;;!! true ? 0 : 1
;;!             ^
(ternary_expression
  if_false: (_) @branch
)

;;!! while true {}
;;!        ^^^^
(while_statement
  condition: (_) @condition
) @condition.domain

;;!! repeat {} while true
;;!                  ^^^^
(repeat_while_statement
  condition: (_) @condition
) @condition.domain

;;!! switch value { }
;;!         ^^^^^
;;!                ^
(switch_statement
  expr: (_) @value
  "{" @branch.iteration.start.endOf @condition.iteration.start.endOf
  "}" @branch.iteration.end.startOf @condition.iteration.end.startOf
) @value.domain

;;!! case 0: break
;;!! default: break
(switch_entry
  ":" @interior.start.endOf
  (statements) @interior.end.endOf
) @branch

;;!! case 0: break
;;!       ^
(switch_entry
  .
  (switch_pattern) @condition.start
  (switch_pattern)? @condition.end
  .
  ":"
) @condition.domain

;;!! /\d+$/
(
  (regex_literal) @regularExpression @textFragment
  (#shrink-to-match! @textFragment "^/(?<keep>.*)/.*$")
)

;;!! func foo() -> Int {}
;;!       ^^^
;;!                ^^^
(function_declaration
  name: (_) @name
  (
    ")" @type.leading.endOf
    "->"
    .
    name: (_) @type
  )?
) @namedFunction @_.domain

;;!! init() {}
;;!  ^^^^
(init_declaration
  name: _ @name
) @namedFunction @name.domain

;;!! func foo() {}
;;!       ^^^
(protocol_function_declaration
  name: (_) @name
) @name.domain

;;!! foo()
;;!  ^^^
(call_expression
  .
  (_) @functionCallee
) @functionCall @functionCallee.domain

;;!! typealias Foo = Int
;;!            ^^^
;;!                  ^^^
(typealias_declaration
  (_) @name @value.leading.endOf
  "="
  (_) @value
) @type @_.domain

;;!! return 0
;;!         ^
;;!! yield 0
;;!        ^
(control_transfer_statement
  result: (_) @value
) @value.domain

;;!! throw Error
;;!        ^^^^^
(control_transfer_statement
  (throw_keyword)
  (_) @value
) @value.domain

;;!! [aaa, bbb]
(array_literal) @list

;;!! [aaa: 0, bbb: 1]
(dictionary_literal
  "[" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "]" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
) @map

;;!! [aaa: 0, bbb: 1]
;;!   ^^^     ^^^
(dictionary_literal
  key: (_) @collectionKey @collectionKey.domain.start
  .
  ":"
  .
  value: (_) @collectionKey.trailing.startOf @collectionKey.domain.end
)

;;!! [aaa: 0, bbb: 1]
;;!        ^       ^
(dictionary_literal
  key: (_) @value.leading.endOf @value.domain.start
  .
  ":"
  .
  value: (_) @value @value.domain.end
)

;;!! foo as Int
;;!         ^^^
(as_expression
  expr: (_) @type.leading.endOf
  (_) @type
  .
) @type.domain

;;!! Map<Int, Int>
;;!      ^^^  ^^^
(type_annotation
  (user_type
    (type_arguments
      (_)? @type.leading.endOf
      .
      (_) @type
      .
      (_)? @type.trailing.startOf
    )
  )
)

;;!! Map<Int, Int>
;;!      ^^^^^^^^
(type_annotation
  (user_type
    (type_arguments
      "<" @type.iteration.start.endOf
      ">" @type.iteration.end.startOf
    )
  )
)

;;!! func foo(aaa: Int, bbb: Int) {}
;;!           ^^^^^^^^  ^^^^^^^^
;;!! init(aaa: Int, bbb: Int) {}
;;!       ^^^^^^^^  ^^^^^^^^
(
  (_
    (parameter)? @_.leading.endOf
    .
    (parameter) @argumentOrParameter
    .
    (parameter)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter comment multiline_comment)
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! { (aaa, bbb) in }
;;!     ^^^  ^^^
(
  (lambda_function_type_parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter comment multiline_comment)
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa, bbb)
;;!      ^^^  ^^^
(
  (value_arguments
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter comment multiline_comment)
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! func foo(aaa: Int, bbb: Int) {}
;;!           ^^^^^^^^^^^^^^^^^^
;;!! init(aaa: Int, bbb: Int) {}
;;!       ^^^^^^^^^^^^^^^^^^
(
  (_
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    .
    (parameter) @argumentList.start
    (parameter) @argumentList.end
    .
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @_dummy @argumentList.domain @argumentOrParameter.iteration.domain
  (#type? @_dummy function_declaration protocol_function_declaration init_declaration)
  (#single-or-multi-line-delimiter! @argumentList.start @_dummy ", " ",\n")
)

(
  (_
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    .
    (parameter) @argumentList
    .
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @_dummy @argumentList.domain @argumentOrParameter.iteration.domain
  (#type? @_dummy function_declaration protocol_function_declaration init_declaration)
  (#single-or-multi-line-delimiter! @argumentList @_dummy ", " ",\n")
)

;;!! func foo() {}
;;!          ><
;;!! init() {}
;;!      ><
(
  [
    (function_declaration
      "(" @argumentList.start.endOf @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      .
      ")" @argumentList.end.startOf @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    )
    (protocol_function_declaration
      "(" @argumentList.start.endOf @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      .
      ")" @argumentList.end.startOf @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    )
    (init_declaration
      "(" @argumentList.start.endOf @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      .
      ")" @argumentList.end.startOf @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    )
  ] @argumentList.domain @argumentOrParameter.iteration.domain
  (#insertion-delimiter! @argumentList.start.endOf "")
)

;;!! { (aaa, bbb) in }
;;!     ^^^^^^^^
(
  (lambda_literal
    (lambda_function_type
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      (lambda_function_type_parameters) @_dummy @argumentList
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    )
  ) @argumentList.domain @argumentOrParameter.iteration.domain
  (#single-or-multi-line-delimiter! @argumentList @_dummy ", " ",\n")
  (#child-range! @argumentList 0 -1)
)

;;!! { () in }
;;!    ><
(
  (lambda_literal
    (lambda_function_type
      "(" @argumentList.start.endOf @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      .
      ")" @argumentList.end.startOf @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    )
  ) @argumentList.domain @argumentOrParameter.iteration.domain
  (#insertion-delimiter! @argumentList.start.endOf "")
)

;;!! foo(aaa, bbb)
;;!      ^^^^^^^^
(
  (call_expression
    (call_suffix
      (value_arguments
        "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
        ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
      ) @argumentList
      (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
      (#child-range! @argumentList 1 -2)
    )
  ) @argumentList.domain @argumentOrParameter.iteration.domain
)

(function_type
  "->" @disqualifyDelimiter
)
