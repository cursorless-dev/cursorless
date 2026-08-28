;; https://github.com/alex-pinkus/tree-sitter-swift/blob/with-generated-files/src/grammar.json

;; document-wide
(source_file) @class.iteration @statement.iteration @name.iteration @value.iteration @type.iteration
(#document-range! @class.iteration @statement.iteration @name.iteration @value.iteration @type.iteration)

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

;; Protocol decl.
(protocol_declaration
  name: (_) @name
  body: (protocol_body
    "{" @interior.start.endOf
    "}" @interior.end.startOf
  )
) @statement

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
  ;;(type_annotation:
  ;;    ":"
  ;;)
) @statement

;; Generic interior w/ top-level iterations
(_
  "{" @interior.start.endOf @statement.iteration.start.endOf @name.iteration.start.endOf
  "}" @interior.end.startOf @statement.iteration.end.startOf @name.iteration.end.startOf
)

(_
  "{" @value.iteration.start.endOf @type.iteration.start.endOf @namedFunction.iteration.start.endOf
  "}" @value.iteration.end.startOf @type.iteration.end.startOf @namedFunction.iteration.end.startOf
)

;; Generic interior -- class iteration
;; Classlikes (class/struct/actor) can be nested within other classlikes, and within both top-level functions and member functions.
;; They, however, cannot be nested within branches or loops of any kind.
(
  (
    (_
      "{" @class.iteration.start.endOf
      "}" @class.iteration.end.startOf
    ) @_dummy
  )
  (#type? @_dummy class_declaration function_declaration)
  (#not-parent-type? @_dummy if_statement switch_statement for_statement while_statement)
  (#not-parent-type? @_dummy do_statement repeat_while_statement protocol_declaration)
)

;; Generic interior -- branch and condition iteration
;; Branches and their conditions cannot be top-level but otherwise have no restrictions
(
  (
    (_
      "{" @branch.iteration.start.endOf @condition.iteration.start.endOf
      "}" @condition.iteration.end.startOf @branch.iteration.end.startOf
    ) @_dummy
  )
  (#not-parent-type? @_dummy source_file)
)

;; Non-enum class (struct/class/actor) decl.
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
  name: (_) @name @type
  body: (enum_class_body
    "{" @interior.start.endOf
    "}" @interior.end.startOf
    .
  )
) @statement

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
