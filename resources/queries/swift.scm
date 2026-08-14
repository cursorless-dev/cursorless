;; https://github.com/alex-pinkus/tree-sitter-swift/blob/with-generated-files/src/grammar.json

;; Comment
(comment) @comment @textFragment
;; Protocol decl.
(protocol_declaration
    name: (_) @name
    body: (protocol_body
        "{" @interior.start.endOf
        "}" @interior.end.startOf
        .
    )
) @statement

;;if statement -- todo seperate main if branch from else and else if branches
(if_statement) @ifStatement @statement @branch

;; generic property delc. -- todo a lot on this ngl
(property_declaration
    name: (_) @name
) @statement

;; Generic interior
(_
    
    "{" @interior.start.endOf
    "}" @interior.end.startOf
    .

)

;; Non-enum class (struct/class) decl.
(class_declaration
    name: (_) @name
    body: (class_body
        "{" @interior.start.endOf
        "}" @interior.end.startOf
        .
    )
) @statement

;; Enum "class: decl.
(class_declaration
    name: (_) @name
    body: (enum_class_body
        "{" @interior.start.endOf
        "}" @interior.end.startOf
        .
    )
) @statement
