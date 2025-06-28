;; import javascript.function.scm
;; import javascript.fieldAccess.scm

;; https://github.com/tree-sitter/tree-sitter-javascript/blob/master/src/grammar.json

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
    generic_type
  )
)

;; `name` scope with `export`
(export_statement
  (_
    name: (_) @name
  ) @_dummy

  ;; We have a special case for this one.  Note we don't need to list the other
  ;; special cases from above because they can't be exported
  (#not-type? @_dummy variable_declarator)
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
        name: (_) @name
        value: (_)? @name.trailing.startOf
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
        name: (_) @name
        value: (_)? @name.trailing.startOf
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
        name: (_) @name
        value: (_)? @name.trailing.startOf
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
    name: (_) @name
    value: (_)? @name.trailing.startOf
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
        (_) @value.leading.endOf
        .
        value: (_)? @value
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
        (_) @value.leading.endOf
        .
        value: (_)? @value
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
        (_) @value.leading.endOf
        .
        value: (_)? @value
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
      (_) @value.leading.endOf
      .
      value: (_)? @value
    ) @_.domain
  ) @_dummy
  (#has-multiple-children-of-type? @_dummy variable_declarator)
)

;;!! let foo, bar;
;;!      ^^^  ^^^
(
  (lexical_declaration
    (variable_declarator)? @_.leading.endOf
    .
    (variable_declarator) @collectionItem
    .
    (variable_declarator)? @_.trailing.startOf
  )
  (#insertion-delimiter! @collectionItem ", ")
)

(lexical_declaration
  .
  (_) @collectionItem.iteration.start.startOf
  (_) @collectionItem.iteration.end.endOf
  .
) @collectionItem.iteration.domain

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
      left: (_) @name @value.leading.endOf
      right: (_) @value @name.trailing.startOf
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
      left: (_) @name @value.leading.endOf
      right: (_) @value @name.trailing.startOf
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
      left: (_) @name @value.leading.endOf
      right: (_) @value @name.trailing.startOf
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
      left: (_) @name @value.leading.endOf
      right: (_) @value @name.trailing.startOf
    )
  ] @_.domain

  (#not-parent-type? @_.domain expression_statement)
)

;;!! function funk({ value = 2 })
;;!                  ^^^^^
;;!                          ^
(object_assignment_pattern
  left: (_) @name @value.leading.endOf
  right: (_) @value
) @_.domain

;;!! const aaa = {bbb};
;;!               ^^^
(shorthand_property_identifier) @collectionKey @value

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

;;!! str => 0
;;!         ^
;;!  --------
(arrow_function
  body: (_) @value @interior
  (#not-type? @value statement_block)
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
) @_.domain

(
  (program) @name.iteration @value.iteration @type.iteration
  (#document-range! @name.iteration @value.iteration @type.iteration)
)

;; Treat interior of all bodies as iteration scopes for `name`, eg
;;!! function foo() {   }
;;!                  ***
(_
  body: (_
    "{" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
    "}" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
  )
)

(
  (_
    body: (_
      "{" @interior.start.endOf
      "}" @interior.end.startOf
    )
  ) @_.domain
  (#not-type? @_.domain try_statement)
)

;;!! const aaa = {bbb: 0, ccc: 0};
;;!               **************
(object
  "{" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "}" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)

;;!! const { aaa: bbb } = ccc;
;;!               ^^^
;;!          --------
(pair_pattern
  key: (_) @collectionKey @value.leading.endOf
  value: (_) @value @collectionKey.trailing.startOf
) @_.domain

;;!! "string"
;;!! `string`
;;!  ^^^^^^^^
[
  (string)
  (template_string)
] @string

;;  taggedTemplate`hello ${world}`
;;! ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(call_expression
  function: (_) @pairDelimiter.start
  arguments: (template_string
    .
    "`" @pairDelimiter.end
  )
)

;;!! // comment
;;!  ^^^^^^^^^^
(comment) @comment

;;!! /\w+/
;;!  ^^^^^
(regex) @regularExpression

[
  (comment)
  (regex_pattern)
] @textFragment

(
  (string) @textFragment
  (#child-range! @textFragment 0 -1 true true)
)

(
  (template_string) @textFragment
  (#child-range! @textFragment 0 -1 true true)
)

;;!! { value: 0 }
;;!  ^^^^^^^^^^^^
[
  (object)
  (object_pattern)
] @map

;;!! [ 0 ]
;;!  ^^^^^
[
  (array)
  (array_pattern)
] @list

;;!! foo()
;;!  ^^^^^
;;!! new Foo()
;;!  ^^^^^^^^^
[
  (call_expression)
  (new_expression)
] @functionCall

;;!! foo()
;;!  ^^^
;;!  -----
(call_expression
  function: (_) @functionCallee
) @_.domain

;;!! new Foo()
;;!  ^^^^^^^
;;!  ---------
(new_expression
  (arguments) @functionCallee.end.startOf
) @functionCallee.start.startOf @_.domain

;;!! class Foo {}
;;!  ^^^^^^^^^^^^
(
  [
    (class_declaration
      name: (_) @className
    )
    (class
      name: (_) @className
    )
  ] @class @type @_.domain
  (#not-parent-type? @class export_statement)
)

;;!! export class Foo {}
;;!  ^^^^^^^^^^^^^^^^^^^
(export_statement
  [
    (class_declaration
      name: (_) @className
    )
    (class
      name: (_) @className
    )
  ]
) @class @type @_.domain

(program) @class.iteration @className.iteration

;;!! true ? 0 : 1
;;!  ^^^^
;;!         ^   ^
;;! -------------
(ternary_expression
  condition: (_) @condition @interior
  consequence: (_) @branch
) @condition.domain

(ternary_expression
  consequence: (_) @branch @interior
)

(ternary_expression
  alternative: (_) @branch @interior
)

;;!! for (let i = 0; i < 2; ++i) {}
;;!                  ^^^^^
;;!  ------------------------------
(for_statement
  condition: (_) @condition
  (#child-range! @condition 0 -1 false true)
) @_.domain

;;!! while (true) {}
;;!         ^^^^
(while_statement
  condition: (_) @condition
  (#child-range! @condition 0 -1 true true)
) @_.domain

;;!! do {} while (true);
;;!               ^^^^
(do_statement
  condition: (_) @condition
  (#child-range! @condition 0 -1 true true)
) @_.domain

;;!! switch (value) { }
;;!          ^^^^^
;;!                  ^
(switch_statement
  value: (_) @private.switchStatementSubject
  body: (_
    "{" @branch.iteration.start.endOf @condition.iteration.start.endOf
    "}" @branch.iteration.end.startOf @condition.iteration.end.startOf
  )
  (#child-range! @private.switchStatementSubject 0 -1 true true)
) @branch.iteration.domain @condition.iteration.domain @private.switchStatementSubject.domain

;;!! case 0: break;
;;!  ^^^^^^^^^^^^^^
;;!       ^
(switch_case
  value: (_) @condition
) @branch @condition.domain

;;!! default: break;
;;!  ^^^^^^^^^^^^^^^
(switch_default) @branch

(switch_case
  body: (_) @interior.start
  body: (_)? @interior.end
  .
  (#not-type? @interior.start "statement_block")
) @_.domain

(switch_default
  body: (_) @interior.start
  body: (_)? @interior.end
  .
  (#not-type? @interior.start "statement_block")
) @_.domain

;;!! if () {}
;;!  ^^^^^^^^
(if_statement) @ifStatement

;;!! if () {}
;;!  ^^^^^^^^
(
  (if_statement
    "if" @branch.start.startOf @branch.removal.start.startOf @interior.domain.start.startOf
    condition: (_) @condition
    consequence: (_
      "{" @interior.start.endOf
      "}" @interior.end.startOf
    ) @branch.end.endOf @branch.removal.end.endOf @interior.domain.end.endOf
    alternative: (_
      (if_statement) @branch.removal.end.startOf
    )?
  ) @condition.domain
  (#not-parent-type? @condition.domain else_clause)
  (#child-range! @condition 0 -1 true true)
)

;;!! else if () {}
;;!  ^^^^^^^^^^^^^
(else_clause
  "else" @branch.start.startOf @condition.domain.start.startOf @interior.domain.start.startOf
  (if_statement
    condition: (_) @condition
    consequence: (_
      "{" @interior.start.endOf
      "}" @interior.end.startOf
    ) @branch.end.endOf @condition.domain.end.endOf @interior.domain.end.endOf
  )
  (#child-range! @condition 0 -1 true true)
)

;;!! else {}
;;!  ^^^^^^^
(else_clause
  (statement_block
    "{" @interior.start.endOf
    "}" @interior.end.startOf
  )
) @branch @interior.domain

;;!! if () {} else if () {} else {}
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(
  (if_statement) @branch.iteration
  (#not-parent-type? @branch.iteration else_clause)
)

;;!! try () {}
;;!  ^^^^^^^^^
(try_statement
  "try" @branch.start @interior.domain.start.startOf
  body: (_
    "{" @interior.start.endOf
    "}" @interior.end.startOf
  ) @branch.end @interior.domain.end.endOf
)

;;!! catch () {}
;;!  ^^^^^^^^^^^
(try_statement
  handler: (_) @branch
)

;;!! finally {}
;;!  ^^^^^^^^^^
(try_statement
  finalizer: (_) @branch
)

;;!! try () {} catch () {} finally {}
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(try_statement) @branch.iteration

[
  (for_statement)
  (for_in_statement)
  (while_statement)
  (do_statement)
] @branch

;;!! { value: 0 }
;;!    ^^^^^
;;!    xxxxxxx
;;!! { value: 0 }
;;!           ^
;;!         xxx
;;!    --------
(pair
  key: (_) @collectionKey @value.leading.endOf
  value: (_) @value @collectionKey.trailing.startOf
) @_.domain

;; Statements that are not a child of an export statement
;; Generated by the following command:
;; > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-typescript/4c20b54771e4b390ee058af2930feb2cd55f2bf8/typescript/src/node-types.json \
;;   | jq '[.[] | select(.type == "statement" or .type == "declaration") | .subtypes[].type]'
(
  [
    (break_statement)
    (class_declaration)
    (continue_statement)
    (debugger_statement)
    (declaration)
    (do_statement)
    (empty_statement)
    (export_statement)
    (expression_statement)
    (for_in_statement)
    (for_statement)
    (generator_function_declaration)
    (if_statement)
    (import_statement)
    (labeled_statement)
    (lexical_declaration)
    (return_statement)
    ;; (statement_block), This is disabled since we want the whole statement and not just the block
    (switch_statement)
    (throw_statement)
    (try_statement)
    (variable_declaration)
    (while_statement)
    (with_statement)

    ;; Manually added1
    (method_definition)
  ] @statement
  (#not-parent-type? @statement export_statement)
)

(
  (program) @statement.iteration
  (#document-range! @statement.iteration)
)

(statement_block
  "{" @statement.iteration.start.endOf
  "}" @statement.iteration.end.startOf
)

;;!! function foo(aaa, bbb) {}
;;!               ^^^  ^^^
(
  (formal_parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa, bbb)
;;!      ^^^  ^^^
(
  (arguments
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! function foo(aaa, bbb) {}
;;!               ^^^^^^^^
(_
  (formal_parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#child-range! @argumentList 1 -2)
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

(formal_parameters
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

;;!! foo(aaa, bbb)
;;!      ^^^^^^^^
(_
  (arguments
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#child-range! @argumentList 1 -2)
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

operator: [
  "<"
  "<<"
  "<<="
  "<="
  ">"
  ">="
  ">>"
  ">>="
  ">>>"
  ">>>="
] @disqualifyDelimiter

(arrow_function
  "=>" @disqualifyDelimiter
)
