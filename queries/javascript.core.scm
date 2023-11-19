;; import javascript.function.scm
;; import javascript.fieldAccess.scm

;; `name` scope without `export`
(
  (_
    name: (_) @name
  ) @_.domain
  (#not-parent-type? @_.domain export_statement)

  ;; We have special cases for these defined elsewhere
  (#not-type?
    @_.domain
    variable_declarator
    method_signature
    abstract_method_signature
    public_field_definition
    field_definition
  )
)

;; `name` scope with `export`
(export_statement
  (_
    name: (_) @name
  ) @dummy

  ;; We have a special case for this one.  Note we don't need to list the other
  ;; special cases from above because they can't be exported
  (#not-type? @dummy variable_declarator)
) @_.domain

;; Special cases for `(let | const | var) foo = ...;` because the full statement
;; is actually a grandparent of the `name` node, so we want the domain to include
;; this full grandparent statement.
(
  [
    ;; name:
    ;;!! (const | let) foo = ...;
    ;;!                ^^^
    ;;!  xxxxxxxxxxxxxxxxxxxx
    ;;!  ------------------------
    ;; value:
    ;;!! (const | let) foo = ...;
    ;;!                      ^^^
    ;;!                   xxxxxx
    ;;!  ------------------------
    (lexical_declaration
      .
      (variable_declarator
        name: (_) @name @name.removal.end.endOf
        value: (_)? @name.removal.end.startOf
      )
    )

    ;; name:
    ;;!! var foo = ...;
    ;;!      ^^^
    ;;!  xxxxxxxxxx
    ;;!  --------------
    ;; value:
    ;;!! var foo = ...;
    ;;!            ^^^
    ;;!         xxxxxx
    ;;!  --------------
    ;; Note that we can't merge this with the variable declaration above because
    ;; of https://github.com/tree-sitter/tree-sitter/issues/1442#issuecomment-1584628651
    (variable_declaration
      .
      (variable_declarator
        name: (_) @name @name.removal.end.endOf
        value: (_)? @name.removal.end.startOf
      )
    )
  ] @_.domain @name.removal.start.startOf
  (#not-parent-type? @_.domain export_statement)

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! (let | const | var) aaa = ..., ccc = ...;
  ;;!  --------------------^^^--------^^^-------
  (#allow-multiple! @name)
)

;; Note that the same domains below will also have the first variable
;; as a target, but that is matched above
(
  [
    ;; name:
    ;;!! (const | let) aaa = 0, bbb = 0;
    ;;!                         ^^^
    ;;!                         xxxxxx
    ;;!  -------------------------------
    ;; value:
    ;;!! (const | let) aaa = 0, bbb = 0;
    ;;!                               ^
    ;;!                            xxxx
    ;;!  -------------------------------
    (lexical_declaration
      (variable_declarator)
      .
      (variable_declarator
        name: (_) @name @name.trailing.start.endOf
        value: (_)? @name.trailing.end.startOf
      )
    )

    ;; name:
    ;;!! var aaa = 0, bbb = 0;
    ;;!               ^^^
    ;;!               xxxxxx
    ;;!  ---------------------
    ;; value:
    ;;!! var aaa = 0, bbb = 0;
    ;;!                     ^
    ;;!                  xxxx
    ;;!  ---------------------
    ;; Note that we can't merge this with the variable declaration above because
    ;; of https://github.com/tree-sitter/tree-sitter/issues/1442#issuecomment-1584628651
    (variable_declaration
      (variable_declarator)
      .
      (variable_declarator
        name: (_) @name @name.trailing.start.endOf
        value: (_)? @name.trailing.end.startOf
      )
    )
  ] @_.domain
  (#not-parent-type? @_.domain export_statement)

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! (let | const | var) aaa = ..., ccc = ...;
  ;;!  --------------------^^^--------^^^-------
  (#allow-multiple! @name)
)

(
  (export_statement
    (_
      ;; name:
      ;;!! export (const | let | var) foo = ...;
      ;;!                             ^^^
      ;;!                             xxxxxx
      ;;!  -------------------------------------
      ;; value:
      ;;!! export (const | let | var) foo = 0;
      ;;!                                   ^
      ;;!                                xxxx
      ;;!  -----------------------------------
      (variable_declarator
        name: (_) @name @name.trailing.start.endOf
        value: (_)? @name.trailing.end.startOf
      )
    )
  ) @_.domain

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! var foo = ..., bar = ...;
  ;;!  ----^^^--------^^^-------
  (#allow-multiple! @name)
)

;; name:
;;!! (const | let | var) aaa = 0, bbb = 0;
;;!                      ^^^
;;!  xxxxxxxxxxxxxxxxxxxxxxxxxx
;;!                      -------
;; value:
;;!! (const | let | var) aaa = 0, bbb = 0;
;;!                            ^
;;!                         xxxx
;;!                      -------
(_
  .
  (variable_declarator
    name: (_) @name @name.removal.end.endOf
    value: (_)? @name.removal.end.startOf
  ) @_.domain
  .
  (variable_declarator)
) @name.removal.start.startOf

;;!! (const | let | var) aaa = 0, bbb = 0;
;;!                               ^^^
;;!                               xxxxxx
;;!                               -------
(_
  (variable_declarator)
  .
  (variable_declarator
    name: (_) @name @name.trailing.start.endOf
    value: (_)? @name.trailing.end.startOf
  ) @_.domain
)

;; Special cases for `(let | const | var) foo = ...;` because the full statement
;; is actually a grandparent of the `name` node, so we want the domain to include
;; this full grandparent statement.
(
  [
    ;;!! (const | let) aaa: Bbb = 0;
    ;;!                           ^
    ;;!                        xxxx
    ;;!  ---------------------------
    (lexical_declaration
      (variable_declarator
        (_) @value.leading.start.endOf
        .
        value: (_)? @value @value.leading.end.startOf
      )
    )

    ;;!! var aaa: Bbb = 0;
    ;;!                 ^
    ;;!              xxxx
    ;;!  -----------------
    ;; Note that we can't merge this with the variable declaration above because
    ;; of https://github.com/tree-sitter/tree-sitter/issues/1442#issuecomment-1584628651
    (variable_declaration
      (variable_declarator
        (_) @value.leading.start.endOf
        .
        value: (_)? @value @value.leading.end.startOf
      )
    )
  ] @_.domain
  (#not-parent-type? @_.domain export_statement)

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! (let | const | var) aaa: Bbb = ..., ccc: Ddd = ...;
  ;;!  -------------------------------^^^-------------^^^-
  (#allow-multiple! @value)
)

(
  (export_statement
    (_
      ;;!! export (const | let | var) aaa: Bbb = 0;
      ;;!                                        ^
      ;;!                                     xxxx
      ;;!  ----------------------------------------
      (variable_declarator
        (_) @value.leading.start.endOf
        .
        value: (_)? @value @value.leading.end.startOf
      )
    )
  ) @_.domain

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! export (let | const | var) aaa: Bbb = ..., ccc: Ddd = ...;
  ;;!  --------------------------------------^^^-------------^^^-
  (#allow-multiple! @value)
)

;;!! (const | let | var) aaa: Ccc = 0, bbb: Ddd = 0;
;;!1                                ^
;;!1                             xxxx
;;!1                     ------------
;;!2                                              ^
;;!2                                           xxxx
;;!2                                   ------------
(
  (_
    (variable_declarator
      (_) @value.leading.start.endOf
      .
      value: (_)? @value @value.leading.end.startOf
    ) @_.domain
  ) @dummy
  (#has-multiple-children-of-type? @dummy variable_declarator)
)

(expression_statement
  [
    ;; name:
    ;;!! foo = 0;
    ;;!  ^^^
    ;;!  xxxxxx
    ;;!  --------
    ;; value:
    ;;!! foo = 0;
    ;;!        ^
    ;;!     xxxx
    ;;!  --------
    (assignment_expression
      left: (_) @name @value.leading.start.endOf @name.trailing.start.endOf
      right: (_) @value @name.trailing.end.startOf @value.leading.end.startOf
    )

    ;; name:
    ;;!! foo += 1;
    ;;!  ^^^
    ;;!  xxxxxxx
    ;;!  ---------
    ;; value:
    ;;!! foo += 1;
    ;;!         ^
    ;;!     xxxxx
    ;;!  ---------
    (augmented_assignment_expression
      left: (_) @name @value.leading.start.endOf @name.trailing.start.endOf
      right: (_) @value @name.trailing.end.startOf @value.leading.end.startOf
    )
  ]
) @_.domain

(
  [
    ;; name:
    ;;!! aaa = 0, bbb = 0;
    ;;!1 ^^^
    ;;!1 xxxxxx
    ;;!1 -------
    ;;!2          ^^^
    ;;!2          xxxxxx
    ;;!2          -------
    ;; value:
    ;;!! aaa = 0, bbb = 0;
    ;;!1       ^
    ;;!1    xxxx
    ;;!1 -------
    ;;!2                ^
    ;;!2             xxxx
    ;;!2          -------
    (assignment_expression
      left: (_) @name @value.leading.start.endOf @name.trailing.start.endOf
      right: (_) @value @name.trailing.end.startOf @value.leading.end.startOf
    )

    ;; name:
    ;;!! aaa += 0, bbb += 0;
    ;;!1 ^^^
    ;;!1 xxxxxxx
    ;;!1 --------
    ;;!2           ^^^
    ;;!2           xxxxxxx
    ;;!2           --------
    ;; value:
    ;;!! aaa += 0, bbb += 0;
    ;;!1        ^
    ;;!1    xxxxx
    ;;!1 --------
    ;;!2                  ^
    ;;!2              xxxxx
    ;;!2           --------
    (augmented_assignment_expression
      left: (_) @name @value.leading.start.endOf @name.trailing.start.endOf
      right: (_) @value @name.trailing.end.startOf @value.leading.end.startOf
    )
  ] @_.domain

  (#not-parent-type? @_.domain expression_statement)
)

;; Match nodes at field `value` of their parent node, setting leading delimiter
;; to be the range until the previous named node
(
  (_
    (_)? @value.leading.start.endOf
    .
    value: (_) @value @value.leading.end.startOf
  ) @_.domain
  (#not-type? @_.domain variable_declarator)
)

;;!! const aaa = {bbb};
;;!               ^^^
(shorthand_property_identifier) @value

;;!! return 0;
;;!         ^
;;!  ---------
(return_statement
  (_) @value
) @_.domain

;;!! yield 0;
;;!        ^
;;!  --------
(yield_expression
  (_) @value
) @_.domain

;; name:
;;!! for (const aaa of bbb) {}
;;!             ^^^
;;!  ----------------------
;; value:
;;!! for (const aaa of bbb) {}
;;!                    ^^^
;;!  ----------------------
(for_in_statement
  left: (_) @name
  right: (_) @value
  ")" @_.domain.end.endOf
) @_.domain.start.startOf

[
  (program)
  (formal_parameters)
] @name.iteration @value.iteration @type.iteration

;; Treat interior of all bodies as iteration scopes for `name`, eg
;;!! function foo() {   }
;;!                  ***
(_
  body: (_
    .
    "{" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
    "}" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
    .
  )
)

;;!! const aaa = {bbb: 0, ccc: 0};
;;!               **************
(object
  "{" @value.iteration.start.endOf
  "}" @value.iteration.end.startOf
)

[
  (string)
  (template_string)
] @string

(comment) @comment

(if_statement) @ifStatement

(regex) @regularExpression

[
  (string_fragment)
  (comment)
  (regex_pattern)
] @textFragment

(
  (template_string) @textFragment
  (#child-range! @textFragment 0 -1 true true)
)
