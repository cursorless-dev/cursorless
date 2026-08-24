;; https://github.com/alex-pinkus/tree-sitter-swift/blob/with-generated-files/src/grammar.json

;; Comment
(comment) @comment @textFragment
;; Protocol decl.
(protocol_declaration
  name: (_) @name
  body: (protocol_body
    "{" @interior.start.endOf
    "}" @interior.end.startOf
  )
) @statement

;;if statement
(
  (if_statement) @ifStatement @statement @branch.iteration
  (#not-parent-type? @ifStatement if_statement)
)

(
  (if_statement
    "if" @branch.start @branch.removal.start
    condition: (_) @condition
    "}" @branch.end @branch.removal.end
    (else)? @branch.removal.end.startOf
  ) @condition.domain
  (#not-parent-type? @condition.domain else)
)

(
  (else) @branch.start @condition.domain.start
  (if_statement
    condition: (_) @condition @condition.domain.end
    "}" @branch.end
  )
)

(
  (else) @branch.start
  "}" @branch.end
)

;; generic property delc
(property_declaration
  name: (_) @name
  ;;(type_annotation:
  ;;    ":"
  ;;)
) @statement

;; Generic interior
(_
  "{" @interior.start.endOf
  "}" @interior.end.startOf
)

;; Non-enum class (struct/class) decl.
(class_declaration
  name: (_) @name
  body: (class_body
    "{" @interior.start.endOf
    "}" @interior.end.startOf
    .
  )
) @statement @class

;; Enum "class" decl.
(class_declaration
  name: (_) @name
  body: (enum_class_body
    "{" @interior.start.endOf
    "}" @interior.end.startOf
    .
  )
) @statement

;; For loop w/ type
(
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
  ) @statement @_.domain
)
