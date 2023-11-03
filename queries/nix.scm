;;
;; Statements
;;

;; Any top-level expression that isn't a comment is a statement
(
    (source_code
        (_) @statement
    ) @_.iteration
    (#not-type? @statement comment)
)
(source_code) @comment.iteration

;; Any foo = <expression> anywhere is a statement
[
    (inherit)
    (binding)
] @statement
(binding_set) @map.iteration @list.iteration @ifStatement.iteration

;; This matches assert statements as stand-alone statements. This
;; is because it's common to have a series of assert statements in a file, which
;; would otherwise all match as a single statement. See the playground/nix/asserts.nix
;; file for an example.
(
    (assert_expression
        "assert" @statement.start
        condition: (_)
        ";" @statement.end
        body: (_)
    ) @_.domain
    (#not-parent-type? @_.domain binding)
)
(assert_expression
    "assert" @functionCallee @functionCall.start
    condition: (_) @condition
    body: (_) @branch @functionCall.end.startOf
) @_.domain

(
    (with_expression) @statement
    (#not-parent-type? @statement binding)
)

;;!! let
;;!!   a = 1;
;;!   <******
;;!!   b = 2;
;;!    *****>
;;!! in a + b
(let_expression
    "let"
    (_) @statement.iteration @value.iteration @name.iteration
)

;;
;; Conditionals
;;

;;!! key = if a then b else c;
;;!        ^^^^^^^^^^^^^^^^^^
(if_expression) @ifStatement @branch.iteration @condition.iteration
;;!! key = if a then b else c;
;;!        ^^^^^^^^^^^
;;!        xxxxxxxxxxxx
(if_expression
    "if" @branch.start
    condition: (_)
    "then"
    consequence: (_) @branch.end @branch.interior
)
;;!! key = if a then b else c;
;;!                    ^^^^^^
;;!                   xxxxxxx
(if_expression
    "else" @branch.start
    alternative: (_) @branch.end @branch.interior
)

;;!! key = if a > 10 then b else c;
;;!           ^^^^^^
(if_expression
    condition: (_) @condition
) @_.domain

;;
;; Lists and maps
;;

;;!! foo = [ a b c ];
;;!          ^
;;!          xx
(list_expression
    element: (_) @collectionItem
)

;;!! foo = [ a b c ];
;;!        ^^^^^^^^^
(list_expression
    element: (_)+ @list.interior
) @list

;;!! foo = { x = 1; y = 2; };
;;!        ^^^^^^^^^^^^^^^^^
[
    (attrset_expression
        (_) @map.interior
    )
    (rec_attrset_expression
        (_) @map.interior
    )
] @map @statement.iteration @value.iteration @name.iteration

;;!! foo = { x = 1; y = 2; };
;;!          ^
;;!          xxxx
;;!          -----
(binding
    attrpath: (_) @collectionKey @_.trailing.start.endOf
    expression: (_) @_.trailing.end.startOf
) @_.domain

;;
;; Strings
;;

;;!! # foo
;;!  ^^^^^
(comment) @comment @textFragment

[
    (string_expression)
    (indented_string_expression)
] @string
(string_fragment) @textFragment

;;!! d = "foo ${bar} baz"
;;!           ^^^^^^
;;!      <**************>
(string_expression
    (interpolation) @argumentOrParameter
) @_.iteration

;;
;; Functions
;;

;; Note for this part of the function, we identify is as lambda only
;;!! x = a: b: a + b;
;;!         ^^^^^^^^ Func1 due to currying
;;!      ^^^^^^^^^^^ Func2 due to currying
(function_expression
    [
        (
            ;; Match foo@{ a, b }: style
            (identifier) @argumentOrParameter.start
            "@"
            (formals) @argumentOrParameter.end
        )
        ;; Match a: style arg
        (identifier) @argumentOrParameter

        ;; Match { a, b }: style
        (formals) @argumentOrParameter
    ]
    .
    body: (_) @anonymousFunction.interior
) @_.domain @anonymousFunction @argumentOrParameter.iteration

;; We define the named function as the full assignment of the lambda
;; This means funk name becomes the variable holding the lambda
(binding
    (_) @functionName
    "="
    expression: (function_expression) @namedFunction.interior
) @namedFunction @functionName.domain

;; Calls to functions are a bit finicky, because of everything being curried lambdas
(
    (apply_expression) @dummy @functionCall @argumentOrParameter.iteration
    (#not-parent-type? @functionCall apply_expression)
)

;; This is gross, but not sure how to do fuzzy matching against an unknown number of
;; nested child nodes. Arbitrarily stopping at 5 args for now, as that ought to be enough
;; arguments for anyone
;; Args:
;;!! mkHost a b c d e
;;!           ^
;;!           xx
;;!        <*********>
;;! Callee:
;;!! mkHost a b c d e
;;!  ^^^^^^
;;!  xxxxxxx
;;!  ----------------
;; The mkHost node looks like this:
;; #   (binding_set
;; #    binding: (binding
;; #     expression: (attrset_expression
;; #      (binding_set
;; #       binding: (binding
;; #        expression: (apply_expression
;; #         function: (apply_expression
;; #          function: (apply_expression
;; #           function: (variable_expression
;; #            name: (identifier)
;; #           )
(apply_expression
    [
        (apply_expression
            function: (variable_expression
                name: (identifier) @functionCallee
            )
        )
        (apply_expression
            [
                (apply_expression
                    function: (variable_expression
                        name: (identifier) @functionCallee
                    )
                )
                (apply_expression
                    [
                        (apply_expression
                            function: (variable_expression
                                name: (identifier) @functionCallee
                            )
                        )
                        (apply_expression
                            (apply_expression
                                function: (variable_expression
                                    name: (identifier) @functionCallee
                                )
                            )
                        )
                    ]
                )
            ]
        )
    ]
) @_.domain

;; Args:
;;!! mkHost a
;;!         ^
;;!         x
;;!  --------
;;! Callee:
;;!! mkHost a
;;!  ^^^^^^
;;!  xxxxxx
;;!  --------
(apply_expression
    function: (variable_expression
        name: (identifier) @functionCallee
    )
    argument: (_) @argumentOrParameter
) @_.domain

(apply_expression
    argument: (_) @argumentOrParameter
)

(function_expression
    (formals) @argumentOrParameter
) @_.domain

;; inherit is a built-in keyword, but is close enough to a function...
;; Callee:
;;!! inherit pkgs input output;
;;!  ^^^^^^^
;;!  xxxxxxxx
;;!  -------------------------
;; Args:
;;!! inherit pkgs input output;
;;!          ^^^^
;;!          xxxxx
;;!         <*****************>
(inherit
    "inherit" @functionCallee
    (
        (inherited_attrs) @argumentOrParameter.iteration
    )
) @functionCall @_.domain
(inherited_attrs
    attr: (_) @argumentOrParameter
)

;;
;; Names and Values
;;

;;!! a = 25;
;;!      ^^
;;!   xxxxx
;;!  -------
(binding
    (_) @_.leading.start.endOf
    .
    expression: (_) @value @_.leading.end.startOf
) @_.domain

;;!! a = 25;
;;!  ^
;;!  xxxx
;;!  -------
(binding
    (_) @name @_.leading.end.startOf @_.trailing.start.endOf
    .
    expression: (_) @_.trailing.end.startOf
) @_.domain
