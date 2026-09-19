;; https://github.com/alex-pinkus/tree-sitter-swift/blob/with-generated-files/src/grammar.json

;; document-wide
(
  (source_file) @value.iteration @type.iteration @interior.iteration
  (#document-range! @value.iteration @type.iteration @interior.iteration)
)

(
  (source_file) @class.iteration @statement.iteration @name.iteration
  (#document-range! @class.iteration @statement.iteration @name.iteration)
)

;; single line comment
(comment) @comment @textFragment

;; multiline comment
(multiline_comment) @comment @textFragment

;; single line string
(line_string_literal
  text: (_) @interior @textFragment
) @string

;; multiline string
(multi_line_string_literal
  text: (_) @interior @textFragment
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

;; Generic interior w/ top-level iterations
(
  (_
    "{" @interior.start.endOf @statement.iteration.start.endOf @name.iteration.start.endOf
    "}" @interior.end.startOf @statement.iteration.end.startOf @name.iteration.end.startOf
  )
)

(
  (_
    "{" @value.iteration.start.endOf @type.iteration.start.endOf @namedFunction.iteration.start.endOf
    "}" @value.iteration.end.startOf @type.iteration.end.startOf @namedFunction.iteration.end.startOf
  )
)

(
  (_
    "{" @class.iteration.start.endOf @branch.iteration.start.endOf @condition.iteration.start.endOf
    "}" @class.iteration.end.startOf @condition.iteration.end.startOf @branch.iteration.end.startOf
  )
)

;; non-enum classlike decl.
(class_declaration
  name: (_) @name @type
  body: (class_body
    "{" @interior.start.endOf
    "}" @interior.end.startOf
  )
) @statement @class

;; Protocol decl.
(protocol_declaration
  name: (_) @name @type
  body: (protocol_body
    "{" @interior.start.endOf
    "}" @interior.end.startOf
  )
) @statement

;; Enum "class" decl.
(class_declaration
  name: (_) @name @type
  body: (enum_class_body
    "{" @interior.start.endOf
    "}" @interior.end.startOf
  )
) @statement @class

;; For loop
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

;; generic type annotation
(
  (type_annotation
    ":" @type.leading
    .
    _ @type
  )
)
