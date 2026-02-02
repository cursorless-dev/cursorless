;; https://github.com/fwcd/tree-sitter-kotlin/blob/main/src/grammar.json

;;
;; Declarations and statements
;;

;; Define @statement based on parent node, because a statement can be an arbitrary expression (with
;; no expression_statement parent node) and we don't want every nested expression to be a statement.
;; (source_file
;;   (_) @statement
;;   (#not-type? @statement import_list)
;; )

;; (import_header) @statement

;; (statements
;;   (_) @statement
;; )

;; (control_structure_body
;;   (_) @statement
;;   (#not-type? @statement statements)
;; )

;; (class_body
;;   (_) @statement
;; )

;; (enum_class_body
;;   (_) @statement
;; )

[
  (class_declaration)
  (function_declaration)
  (secondary_constructor)
  (anonymous_initializer)
  (property_declaration)
  (assignment)
  (for_statement)
  (while_statement)
  (do_while_statement)
  (jump_expression)
  (when_expression)
  (try_expression)

  ;; Disabled on purpose. We have a better definition of this below.
  ;; (if_expression)
] @statement

(control_structure_body
  (call_expression) @statement
)
(source_file
  (call_expression) @statement
)

;; Entire document, including leading and trailing whitespace
(
  (source_file) @class.iteration @statement.iteration @namedFunction.iteration
  (#document-range! @class.iteration @statement.iteration @namedFunction.iteration)
)
(
  (source_file) @name.iteration @value.iteration @type.iteration
  (#document-range! @name.iteration @value.iteration @type.iteration)
)

;;!! { }
;;!   ^
(_
  "{" @statement.iteration.start.endOf @namedFunction.iteration.start.endOf
  "}" @statement.iteration.end.startOf @namedFunction.iteration.end.startOf
)
(_
  "{" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  "}" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

;;!! { }
;;!   ^
(_
  "{" @interior.start.endOf
  "}" @interior.end.startOf
)

;; (object_declaration
;;   (type_identifier) @name
;; ) @class @name.domain

;; (companion_object
;;   (type_identifier) @name
;; ) @class @name.domain

;;!! fun foo(): Int {}
;;!      ^^^
;;!             ^^^
(function_declaration
  (simple_identifier) @name
  (function_value_parameters) @type.leading.endOf
  (user_type)? @type
) @namedFunction @_.domain

;;!! constructor() {}
(secondary_constructor
  "constructor" @name
) @namedFunction @name.domain

;;!! fun() {}
(anonymous_function) @anonymousFunction

;;!! {x -> 0}
(lambda_literal
  (statements)? @value
) @anonymousFunction @value.domain

;;
;; Literals and comments
;;

;;!! "Hello world"
(string_literal
  (string_content) @textFragment
) @string

[
  ;;!! // Hello world
  (line_comment)
  ;;!! /* Hello world */
  (multiline_comment)
] @comment @textFragment

;;
;; Branches and conditions
;;

;; Top level if statement
(
  (_
    (if_expression) @ifStatement @statement @branch.iteration
  ) @_dummy
  (#not-parent-type? @_dummy if_expression)
)

(
  (_
    (if_expression
      "if" @branch.start @branch.removal.start.startOf
      condition: (_) @condition
      consequence: (_) @branch.end @branch.removal.end.endOf
      "else"? @branch.removal.end.startOf
      alternative: (control_structure_body
        .
        (if_expression) @branch.removal.end.startOf
      )?
    ) @condition.domain
  ) @_dummy
  (#not-parent-type? @_dummy if_expression)
)

;;!! else if (true) {}
(if_expression
  "else" @condition.domain.start @branch.start
  (control_structure_body
    (if_expression
      condition: (_) @condition
      consequence: (_) @condition.domain.end @branch.end
    )
  )
)

;;!! else {}
(if_expression
  "else" @branch.start
  (control_structure_body
    "{"
  ) @branch.end
)

;;!! if (true) 0 else 1
;;!              ^^^^^^
(if_expression
  "else" @branch.start
  (control_structure_body
    .
    (_) @_dummy
  ) @branch.end
  (#not-type? @_dummy if_expression)
)

;;!! try {} catch {}
(try_expression
  "try" @branch.start
  "}" @branch.end
) @branch.iteration

;;!! catch (e: Exception) {}
;;!         ^^^^^^^^^^^^
(catch_block
  (simple_identifier) @argumentOrParameter.start
  ":"
  (user_type) @argumentOrParameter.end
) @branch

;;!! catch (e: Exception) {}
;;!         ^
(catch_block
  (simple_identifier) @name @name.domain.start
  ":"
  (user_type) @name.domain.end
)

;;!! catch (e: Exception) {}
;;!            ^^^^^^^^^
(catch_block
  (simple_identifier) @type.domain.start @type.leading.endOf
  ":"
  (user_type) @type @type.domain.end
)

;;!! finally {}
(finally_block) @branch

;;!! when (foo) { }
;;!        ^^^
;;!              ^
(when_expression
  (when_subject
    (_) @value
  )
  "{" @branch.iteration.start.endOf @condition.iteration.start.endOf
  "}" @branch.iteration.end.startOf @condition.iteration.end.startOf
) @value.domain @branch.iteration.domain @condition.iteration.domain

;;!! 0 -> break
(when_entry) @branch

;;!! 0, 1 -> break
;;!  ^  ^
(when_entry
  (when_condition) @condition
  (#allow-multiple! @condition)
) @condition.domain

;;!! 0 -> break
;;!      ^^^^^^
(when_entry
  "->" @interior.start.endOf
  (control_structure_body
    .
    (_)
  ) @interior.end.endOf
) @interior.domain

;; (if_expression
;;   "if"
;;   .
;;   "("
;;   .
;;   (_) @condition
;;   .
;;   ")"
;; ) @_.domain

;; If branch
;; (if_expression
;;   "if" @branch.start @branch.removal.start
;;   .
;;   "("
;;   .
;;   (_)
;;   .
;;   ")"
;;   .
;;   (control_structure_body) @branch.end @branch.removal.end
;;   (
;;     "else"
;;     (control_structure_body) @branch.removal.end.startOf
;;   )?
;; )

;; Else-if branch
;; (if_expression
;;   "else" @branch.start @condition.domain.start
;;   (control_structure_body
;;     (if_expression
;;       "if"
;;       .
;;       "("
;;       .
;;       (_) @condition
;;       .
;;       ")"
;;       .
;;       (control_structure_body) @branch.end @condition.domain.end
;;     )
;;   )
;; )

;; Else branch
;; (if_expression
;;   "else" @branch.start
;;   (control_structure_body) @branch.end
;; )

;;!! while (true) {}
;;!         ^^^^
(while_statement
  "while"
  "("
  (_) @condition
  ")"
) @condition.domain

;;!! do {} while (true)
;;!               ^^^^
(do_while_statement
  "("
  (_) @condition
  ")"
) @condition.domain

;;
;; Name, value, type, and key
;;

;; (type_alias
;;   "typealias"
;;   .
;;   (_) @name.start
;;   (_)? @name.end
;;   .
;;   "="
;;   .
;;   (_) @value.start @type.start
;; ) @value.end.endOf @type.end.endOf @_.domain

;;!! class Foo {}
(class_declaration
  (type_identifier) @name
) @class @type @name.domain

;; (class_parameter
;;   (simple_identifier) @name
;; ) @_.domain

;; (class_parameter
;;   ":"
;;   .
;;   (_) @type.start
;;   (_)? @type.end
;;   .
;;   "="
;;   (_) @value
;; ) @_.domain

;; ;; Known issue: this won't work with multiple-node types.
;; (class_parameter
;;   ":"
;;   .
;;   (_) @type
;;   .
;; ) @_.domain

;; ;; Function declarations with type constraints
;; (function_declaration
;;   ":"
;;   .
;;   (_) @type.start
;;   (_)? @type.end
;;   .
;;   (type_constraints)
;; ) @_.domain

;; ;; Function declarations with no type constraints but with body
;; (
;;   (function_declaration
;;     ":"
;;     .
;;     (_) @type
;;     .
;;     (function_body)
;;   ) @_.domain
;; )
;; (
;;   (function_declaration
;;     ":"
;;     .
;;     (_) @type.start
;;     (_) @type.end
;;     .
;;     (function_body)
;;   ) @_.domain
;;   (#not-type? @type.end "type_constraints")
;; )

;; ;; Function declaration without body or type constraints
;; (
;;   (function_declaration
;;     ":"
;;     .
;;     (_) @type
;;     .
;;   ) @_.domain
;; )
;; (
;;   (function_declaration
;;     ":"
;;     .
;;     (_) @type.start
;;     (_) @type.end
;;     .
;;   ) @_.domain
;;   (#not-type? @type.end "function_body")
;;   (#not-type? @type.end "type_constraints")
;; )

;; (variable_declaration
;;   (simple_identifier) @name
;; ) @_.domain

;; (variable_declaration
;;   ":"
;;   .
;;   (_) @type.start
;; ) @type.end.endOf @_.domain

;; (multi_variable_declaration) @name.iteration @type.iteration

;;!! val foo: Int
;;!      ^^^
;;!           ^^^
;; (property_declaration
;;   (variable_declaration
;;     (simple_identifier) @name @type.leading.endOf
;;     (user_type)? @type
;;   )
;; ) @_.domain

;;!! val foo: Int = 0
;;!      ^^^
;;!           ^^^
;;!                 ^
(property_declaration
  (variable_declaration
    (simple_identifier) @name @type.leading.endOf
    (user_type)? @type
  ) @value.leading.endOf
  (
    "="
    (_) @value
  )?
) @_.domain

;;!! val (foo, bar) = baz
;;!      ^^^^^^^^^^
;;!                   ^^^
(property_declaration
  (multi_variable_declaration) @name @value.leading.endOf
  (_) @value
) @_.domain

;;!! foo = 0
;;!  ^^^
;;!        ^
(assignment
  (directly_assignable_expression) @name @value.leading.endOf
  (_) @value
  .
) @_.domain

;;!! typealias Foo = Bar
;;!            ^^^
;;!                  ^^^
(type_alias
  (type_identifier) @name @value.leading.endOf
  (user_type) @value
) @type @_.domain

;; (property_declaration
;;   "="
;;   .
;;   (_) @value
;; ) @_.domain

;; (property_declaration
;;   (property_delegate
;;     (_) @value
;;   )
;; ) @_.domain

;; (property_declaration
;;   (variable_declaration
;;     ":"
;;     .
;;     (_) @type.start
;;   ) @type.end.endOf
;; ) @_.domain

;; (property_declaration
;;   (multi_variable_declaration) @name.iteration @type.iteration
;; ) @name.iteration.domain @type.iteration.domain

;;!! for (v: Int in values) {}
;;!       ^
;;!          ^^^
(for_statement
  (variable_declaration
    (simple_identifier) @name @type.leading.endOf
    (user_type)? @type
  )
  "in"
  .
  (_) @value
) @_.domain

;;!! for (i in 0 until size) {}
;; (for_statement
;;   "in"
;;   .
;;   (_) @value
;; ) @value.domain

;; (for_statement
;;   (variable_declaration
;;     ":"
;;     .
;;     (_) @type.start
;;   ) @type.end.endOf
;; ) @type.domain

;; (for_statement
;;   (multi_variable_declaration) @name.iteration @type.iteration
;; ) @name.iteration.domain @type.iteration.domain

;; (when_subject
;;   (variable_declaration
;;     (simple_identifier) @name
;;   )
;; ) @name.domain

;; (when_subject
;;   "="
;;   .
;;   (_) @value
;; ) @value.domain

;; (when_subject
;;   (variable_declaration
;;     ":"
;;     .
;;     (_) @type.start
;;   ) @type.end.endOf
;; ) @type.domain

;; (getter
;;   ":"
;;   .
;;   (_) @type.start
;;   (_)? @type.end
;;   (function_body)
;; ) @type.domain

;; (setter
;;   ":"
;;   .
;;   (_) @type.start
;;   (_)? @type.end
;;   (function_body)
;; ) @type.domain

;; (parameter_with_optional_type
;;   (simple_identifier) @name
;; ) @name.domain

;; (parameter_with_optional_type
;;   ":"
;;   .
;;   (_) @type.start
;; ) @type.end.endOf @type.domain

;; Function parameter without default
;; (function_value_parameters
;;   (parameter
;;     (simple_identifier) @name
;;     ":"
;;     .
;;     (_) @type.start
;;   ) @type.end.endOf @_.domain
;; )

;; Function parameter with default
;; (function_value_parameters
;;   (parameter
;;     (simple_identifier) @name
;;     ":"
;;     .
;;     (_) @type.start
;;   ) @type.end.endOf @_.domain.start
;;   .
;;   "="
;;   .
;;   (_) @value @_.domain.end
;; )

;; (anonymous_function
;;   ":"
;;   .u
;;   (_) @type.start
;;   (_)? @type.end
;;   .
;;   (function_body)
;; ) @_.domain

;; (
;;   (anonymous_function
;;     ":"
;;     .
;;     (_) @type
;;     .
;;   ) @_.domain
;; )
;; (
;;   (anonymous_function
;;     ":"
;;     .
;;     (_) @type.start
;;     (_) @type.end
;;     .
;;   ) @_.domain
;;   (#not-type? @type.end "function_body")
;; )

;;!! return 0
;;!         ^
(jump_expression
  [
    "return"
    "throw"
  ]
  (_) @value
) @value.domain

;; (jump_expression
;;   "return@"
;;   .
;;   (label)
;;   .
;;   (_) @value
;; ) @_.domain

;; (_
;;   (function_body
;;     "="
;;     .
;;     (_) @value
;;   )
;; ) @_.domain

;; (value_argument
;;   (simple_identifier) @name
;;   "="
;;   .
;;   (_) @value.start
;; ) @value.end.endOf @_.domain

;; (infix_expression
;;   (_) @collectionKey
;;   (simple_identifier) @_dummy
;;   (#eq? @_dummy "to")
;;   (_) @value
;; ) @_.domain

;;
;; Function call, callee, arguments, and parameters
;;

;; [
;;   (call_expression)
;;   ;; (constructor_invocation)
;;   ;; (constructor_delegation_call)
;; ] @functionCall

;;!! foo()
;;!  ^^^
(call_expression
  [
    (simple_identifier)
    (navigation_expression)
  ] @functionCallee
) @functionCall @functionCallee.domain

;; (call_suffix
;;   (annotated_lambda) @argumentOrParameter
;; )

;; (call_expression
;;   (call_suffix) @argumentOrParameter.iteration
;; ) @argumentOrParameter.iteration.domain

;; (constructor_invocation
;;   (user_type) @functionCallee
;; ) @_.domain

;; (constructor_invocation
;;   (value_arguments
;;     "(" @argumentOrParameter.iteration.start.endOf
;;     ")" @argumentOrParameter.iteration.end.startOf
;;   )
;; ) @argumentOrParameter.iteration.domain

;; (constructor_delegation_call
;;   [
;;     "this"
;;     "super"
;;   ] @functionCallee
;; ) @_.domain

;;!! fun foo(aaa: Int, bbb: Int) {}
;;!          ^^^^^^^^^^^^^^^^^^
(_
  (function_value_parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

(function_value_parameters
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

(
  (function_value_parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! { aaa, bbb -> }
;;!    ^^^^^^^^
(lambda_literal
  (lambda_parameters) @argumentList @argumentOrParameter.iteration
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! { -> }
(lambda_literal
  "{" @argumentList.start.endOf @argumentList.removal.start.endOf
  .
  [
    (statements)
    "->"
    "}"
  ]
) @argumentList.domain

(
  (lambda_parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! class Foo(aaa: Int, bbb: Int) {}
;;!            ^^^^^^^^^^^^^^^^^^
(class_declaration
  (primary_constructor
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

(primary_constructor
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

(
  (primary_constructor
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa, bbb)
;;!      ^^^^^^^^
(call_expression
  (call_suffix
    (value_arguments
      "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
      ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
    ) @argumentList
    (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
    (#child-range! @argumentList 1 -2)
  )
) @argumentList.domain @argumentOrParameter.iteration.domain

(value_arguments
  "(" @name.iteration.start.endOf @value.iteration.start.endOf @type.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf @type.iteration.end.startOf
)

(
  (value_arguments
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa = 0)
;;!      ^^^
;;!            ^
(value_argument
  (simple_identifier) @name @value.leading.endOf
  "="
  (_) @value
) @_.domain

;;!! var foo: Map<Int, Int>
;;!               ^^^^^^^^
(type_arguments
  "<" @type.iteration.start.endOf
  ">" @type.iteration.end.startOf
)

;;!! var foo: Map<Int, Int>
;;!               ^^^  ^^^
(
  (type_arguments
    (_)? @_.leading.endOf
    .
    (_) @type
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @type @_dummy ", " ",\n")
)

;;!! fun Foo(aaa: Int = 0) {}
;;!          ^^^
;;!               ^^^
;;!                     ^
(function_value_parameters
  (parameter
    (simple_identifier) @name @type.leading.endOf
    (user_type) @type
  ) @_.domain.start @value.leading.endOf
  .
  (
    "="
    .
    (_) @value @_.domain.end
  )?
)

;;!! class Foo(aaa: Int = 0) {}
;;!            ^^^
;;!                 ^^^
;;!                       ^
(class_parameter
  (simple_identifier) @name @type.leading.endOf
  (user_type) @type @value.leading.endOf
  (
    "="
    (_) @value
  )?
) @_.domain

;; (constructor_delegation_call
;;   (value_arguments
;;     "(" @argumentOrParameter.iteration.start.endOf
;;     ")" @argumentOrParameter.iteration.end.startOf
;;   )
;; ) @argumentOrParameter.iteration.domain

;;!! BAR,
(enum_entry
  (simple_identifier) @name
) @name.domain

;;!! BAR()
(enum_entry
  (simple_identifier) @functionCallee
  (value_arguments)
) @functionCall @functionCallee.domain

;; (
;;   (function_value_parameters
;;     (_)? @_.leading.endOf
;;     .
;;     [
;;       ","
;;       "("
;;     ]
;;     .
;;     [
;;       (line_comment)
;;       (multiline_comment)
;;     ] *
;;     .
;;     (parameter_modifiers)? @argumentOrParameter.start
;;     .
;;     (parameter) @argumentOrParameter.end
;;     .
;;     [
;;       (line_comment)
;;       (multiline_comment)
;;     ] *
;;     .
;;     [
;;       ","
;;       ")"
;;     ]
;;     .
;;     (_)? @_.trailing.startOf
;;   ) @_dummy
;;   (#single-or-multi-line-delimiter! @argumentOrParameter.end @_dummy ", " ",\n")
;; )

;; (
;;   (function_value_parameters
;;     (_)? @_.leading.endOf
;;     .
;;     [
;;       ","
;;       "("
;;     ]
;;     .
;;     [
;;       (line_comment)
;;       (multiline_comment)
;;     ] *
;;     .
;;     (parameter_modifiers)? @argumentOrParameter.start.startOf
;;     .
;;     (parameter) @argumentOrParameter.start
;;     .
;;     (_) @argumentOrParameter.end
;;     (#not-type? @argumentOrParameter.end "parameter" "parameter_modifiers")
;;     .
;;     [
;;       (line_comment)
;;       (multiline_comment)
;;     ] *
;;     .
;;     [
;;       ","
;;       ")"
;;     ]
;;     .
;;     (_)? @_.trailing.startOf
;;   ) @_dummy
;;   (#single-or-multi-line-delimiter! @argumentOrParameter.end @_dummy ", " ",\n")
;; )

;; (_
;;   (function_value_parameters) @argumentOrParameter.iteration
;; ) @argumentOrParameter.iteration.domain

;; (
;;   (primary_constructor
;;     (_)? @_.leading.endOf
;;     .
;;     (class_parameter) @argumentOrParameter
;;     .
;;     (_)? @_.trailing.startOf
;;   ) @_dummy
;;   (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
;; )

;; (class_declaration
;;   (primary_constructor) @argumentOrParameter.iteration
;; ) @argumentOrParameter.iteration.domain

;; (parameter_with_optional_type) @argumentOrParameter

;; There is only one parameter allowed, but we treat it as iterable for consistency.
;; (setter
;;   (parameter_with_optional_type) @argumentOrParameter.iteration
;; ) @argumentOrParameter.iteration.domain

;; (
;;   (lambda_parameters
;;     (_)? @_.leading.endOf
;;     .
;;     [
;;       (variable_declaration)
;;       (multi_variable_declaration)
;;     ] @argumentOrParameter
;;     .
;;     (_)? @_.trailing.startOf
;;   ) @_dummy
;;   (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
;; )

;; (lambda_literal
;;   (lambda_parameters) @argumentOrParameter.iteration
;; ) @argumentOrParameter.iteration.domain

(comparison_expression
  [
    "<"
    ">"
    "<="
    ">="
  ] @disqualifyDelimiter
)
(lambda_literal
  "->" @disqualifyDelimiter
)
(when_entry
  "->" @disqualifyDelimiter
)
