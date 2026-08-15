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
(
    (if_statement) @ifStatement @statement @branch.domain
    (#not-parent-type? @ifStatement if_statement)
)

(
    (if_statement
        "if" @branch.start.startOf @branch.removal.start
        condition: (_) @condition
        (statements) @interior.start.startOf @interior.end.endOf
        .
        "}" @branch.end.endOf @branch.removal.end
        (else)? @branch.removal.end.startOf 
    ) @condition.domain
    (#not-parent-type? @condition.domain if_statement)
)

(
    (if_statement
        (else) @branch.start @condition.domain.start
        (if_statement
            condition: (_) @condition
            (statements) @interior.start.startOf @interior.end.endOf
            .
            "}" @branch.end.endOf @condition.domain.end
        )
    )
)

;; generic property delc. -- todo a lot on this ngl
(property_declaration
    name: (_) @name
) @statement

;; Generic interior
;;(_
    
;;    "{" @interior.start.endOf
;;    "}" @interior.end.startOf
;;    .

;;)

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
