;; https://github.com/alex-pinkus/tree-sitter-swift/blob/with-generated-files/src/grammar.json

[
  (class_declaration)
  (protocol_declaration)
  (for_statement)
  (property_declaration)

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

;;!! """Hello world"""
;;!  ^^^^^^^^^^^^^^^^^
;;!     ^^^^^^^^^^^
(multi_line_string_literal
  text: (_) @textFragment
) @string

;; extended delimiter/"raw" strings (both multiline and single line) -- waiting on better tree-sitter support for these
;;(raw_string_literal
;;  text: (_) @interior @textFragment
;;) @string

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

;;!! let foo: Int = 0
;;!! var foo: Int 0
;;!      ^^^
;;!           ^^^
;;!                 ^
(property_declaration
  name: (_) @name
  (type_annotation
    ":" @type.leading
    (_) @type
  )?
  (
    "=" @value.leading
    value: (_) @value
  )?
) @_.domain

;;!! let foo: Int { get set}
;;!      ^^^
;;!           ^^^
(protocol_property_declaration
  name: (_) @name
  (type_annotation
    ":" @type.leading
    (_) @type
  )
) @_.domain
