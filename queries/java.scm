;; Generated by the following command:
;; > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-java/master/src/node-types.json | jq '[.[] | select(.type == "statement" or .type == "declaration") | .subtypes[].type]'
[
    (annotation_type_declaration)
    (class_declaration)
    (enum_declaration)
    (import_declaration)
    (interface_declaration)
    (module_declaration)
    (package_declaration)
    (assert_statement)
    (break_statement)
    (continue_statement)
    (declaration)
    (do_statement)
    (enhanced_for_statement)
    (expression_statement)
    (for_statement)
    (if_statement)
    (labeled_statement)
    (local_variable_declaration)
    (return_statement)
    (switch_expression)
    (synchronized_statement)
    (throw_statement)
    (try_statement)
    (try_with_resources_statement)
    (while_statement)
    (yield_statement)

    ;; exceptions
    ;; ";",
    ;; "block",
    (method_declaration)
    (constructor_declaration)
    (field_declaration)
] @statement

(class_declaration
    name: (_) @className
) @class @className.domain

;;!! void myFunk() {}
;;!  ^^^^^^^^^^^^^^^^
(method_declaration
    (identifier) @functionName
) @namedFunction @functionName.domain
(constructor_declaration
    (identifier) @functionName
) @namedFunction @functionName.domain

;;!! ((value) -> true)
;;!   ^^^^^^^^^^^^^^^
(lambda_expression) @anonymousFunction

;;!! if (value) {}
;;!  ^^^^^^^^^^^^^
(
    (if_statement) @ifStatement
    (#not-parent-type? @ifStatement "if_statement")
)

;;!! "string"
;;!  ^^^^^^^^
(string_literal) @string @textFragment

;;!! // comment
;;!  ^^^^^^^^^^
[
    (line_comment)
    (block_comment)
] @comment @textFragment

;;!! int[] values = {1, 2, 3};
;;!                 ^^^^^^^^^
(array_initializer) @list

;;!! List<String> value = new ArrayList() {{ add("a"); }};
;;!                                       ^^^^^^^^^^^^^^^
(object_creation_expression
    (class_body
        (block) @map
    )
)

[
    (method_invocation)
    (object_creation_expression)
    (explicit_constructor_invocation)
] @functionCall

;;!! case "0": return "zero";
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^
;;!! case "0" -> "zero";
;;!  ^^^^^^^^^^^^^^^^^^^
[
    (switch_block_statement_group)
    (switch_rule)
] @branch

;;!! case "0": return "zero";
;;!       ^^^
;;!  ------------------------
(switch_block_statement_group
    (switch_label
        (_) @condition
    )
) @condition.domain

;;!! case "0" -> "zero";
;;!       ^^^
;;!  -------------------
(switch_rule
    (switch_label
        (_) @condition
    )
) @condition.domain

(switch_expression) @branch.iteration @condition.iteration

;;!! if () {}
;;!  ^^^^^^^^
(
    (if_statement
        "if" @branch.start @condition.domain.start
        condition: (_) @condition
        consequence: (block) @branch.end @condition.domain.end
    ) @dummy
    (#not-parent-type? @dummy "if_statement")
    (#child-range! @condition 0 -1 true true)
)

;;!! else if () {}
;;!  ^^^^^^^^^^^^^
(if_statement
    "else" @branch.start @condition.domain.start
    alternative: (if_statement
        condition: (_) @condition
        consequence: (block) @branch.end @condition.domain.end
        (#child-range! @condition 0 -1 true true)
    )
)

;;!! else {}
;;!  ^^^^^^^
(if_statement
    "else" @branch.start
    alternative: (block) @branch.end
)

;;!! for (int i = 0; i < 5; ++i) {}
;;!                  ^^^^^
;;!  ------------------------------
(for_statement
    condition: (_) @condition
) @_.domain

;;!! while (value) {}
;;!         ^^^^^
;;!  ----------------
(while_statement
    condition: (_) @condition
    (#child-range! @condition 0 -1 true true)
) @_.domain

;;!! switch (value) {}
;;!          ^^^^^
;;!  -----------------
(switch_expression
    condition: (_) @switchStatementSubject
    (#child-range! @switchStatementSubject 0 -1 true true)
) @_.domain

;;!! true ? 1 : 2
(ternary_expression
    condition: (_) @condition
    consequence: (_) @branch
) @condition.domain
(ternary_expression
    alternative: (_) @branch
)

;;!! true ? 1 : 2
;;!  ^^^^^^^^^^^^
(ternary_expression) @branch.iteration

(_
    name: (_) @name
) @_.domain

;;!! void myFunk(int value) {}
;;!                  ^^^^^
;;!  -------------------------
(formal_parameters
    (formal_parameter
        (identifier) @name
    ) @_.domain
) @_.iteration

;;!! int value = 0;
;;!      ^^^^^
;;!  --------------
(assignment_expression
    left: (_) @name
) @_.domain
