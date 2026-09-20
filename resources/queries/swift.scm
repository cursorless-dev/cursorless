;; https://github.com/alex-pinkus/tree-sitter-swift/blob/with-generated-files/src/grammar.json

[
  (class_declaration)
  (protocol_declaration)
  (for_statement)

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
(_
  "{" @statementNameValueType.iteration.start.endOf @class.iteration.start.endOf @namedFunction.iteration.start.endOf
  "}" @statementNameValueType.iteration.end.startOf @class.iteration.end.startOf @namedFunction.iteration.end.startOf
)

(_
  "{" @interior.start.endOf
  "}" @interior.end.startOf
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

;; if statement
(
  (if_statement) @ifStatement @statement @branch.iteration
  (#not-parent-type? @ifStatement if_statement)
)

;; if statement w/ condition & child branches
(
  (if_statement
    "if" @branch.start @branch.removal.start
    condition: (_) @condition
    "}" @branch.end @branch.removal.end
    (else)? @branch.removal.end.startOf
  ) @condition.domain
  (#not-parent-type? @condition.domain else)
)

;; else if
(
  (else) @branch.start @condition.domain.start
  (if_statement
    condition: (_) @condition @condition.domain.end
    "}" @branch.end
  )
)

;; else
(
  (else) @branch.start
  "}" @branch.end
)

;; generic property delc
(property_declaration
  name: (_) @name
) @statement

;;!! struct Foo {}
;;!         ^^^
(class_declaration
  name: (_) @name
  (class_body)
) @class

;;!! enum Foo {}
;;!       ^^^
(class_declaration
  name: (_) @name
  (enum_class_body)
) @type

;;!! protocol Foo {}
;;!           ^^^
(protocol_declaration
  name: (_) @name
) @type

;; For loop
(for_statement
  "for"
  item: (_) @name
  (type_annotation
    ":" @type.leading
    .
    _ @type @name.trailing
  )?
  "in"
  collection: (_) @value
) @_.domain

;; generic type annotation
(
  (type_annotation
    ":" @type.leading
    .
    _ @type
  )
)
