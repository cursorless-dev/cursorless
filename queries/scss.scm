;; import css.scm

;; https://github.com/serenadeai/tree-sitter-scss/blob/master/src/grammar.json

;; curl https://raw.githubusercontent.com/serenadeai/tree-sitter-scss/c478c6868648eff49eb04a4df90d703dc45b312a/src/node-types.json \
;; | jq '[.[] | select(.type =="stylesheet") | .children.types[] | select(.type !="declaration") | .type ]'

[
  (apply_statement)
  (at_rule)
  (charset_statement)
  (debug_statement)
  (each_statement)
  (error_statement)
  (for_statement)
  (forward_statement)
  (function_statement)
  (if_statement)
  (import_statement)
  (include_statement)
  (keyframes_statement)
  (media_statement)
  (mixin_statement)
  (namespace_statement)
  (placeholder)
  (rule_set)
  (supports_statement)
  (use_statement)
  (warn_statement)
  (while_statement)
] @statement

;;!! { }
;;!   ^
(_
  .
  "{" @interior.start.endOf
  "}" @interior.end.startOf
  .
)

(single_line_comment) @comment @textFragment

;;!! @if true { }  @else { }
;;!  ^^^^^^^^^^^^^^^^^^^^^^^
;;!      ^^^^
(if_statement
  (if_clause
    (condition) @condition
  )
) @ifStatement @condition.domain @branch.iteration

;;!! @if true { }  @else if false { }
;;!   xxxxxxxxxxxxxxxxxxx
(if_statement
  (if_clause) @branch @branch.removal.start.startOf
  (else_if_clause
    "if" @branch.removal.end.startOf
  )
  (#character-range! @branch.removal.start.startOf 1)
)

;; Single if statement are else if. Remove range is content range.
(if_statement
  (if_clause) @branch
  (else_clause)?
  .
)

;;!! @else false { }
;;!  ^^^^^^^^^^^^^^^
;;!        ^^^^^
(else_if_clause
  (condition) @condition
) @branch @condition.domain

;;!! @else { }
;;!  ^^^^^^^^^
(else_clause) @branch

(mixin_statement
  (name) @name
) @namedFunction @name.domain

(function_statement
  (name) @name
) @namedFunction @name.domain

(declaration
  (variable_name) @name
) @_.domain

;;!! replace-text($image, $color: red)
;;!               ^^^^^^  ^^^^^^^^^^^
(
  (parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

(_
  (parameters
    "(" @argumentOrParameter.iteration.start.endOf
    ")" @argumentOrParameter.iteration.end.startOf
  )
) @argumentOrParameter.iteration.domain

(parameters
  "(" @name.iteration.start.endOf @value.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf
)

;;!! foo($foo: 123)
;;!      ^^^^  ^^^
(
  (parameter
    (variable_name) @name
    (default_value)? @value
  ) @_.domain
  (#not-eq? @_.domain "")
)

(
  (stylesheet) @namedFunction.iteration @name.iteration
  (#document-range! @namedFunction.iteration @name.iteration)
)

(block
  "{" @namedFunction.iteration.start.endOf @name.iteration.start.endOf
  "}" @namedFunction.iteration.end.startOf @name.iteration.end.startOf
)

(binary_expression
  [
    "<"
    "<="
    ">"
    ">="
  ] @disqualifyDelimiter
)

;;!! @include rtl(float, left, right);
;;!           ^^^^^^^^^^^^^^^^^^^^^^^
(include_statement
  (identifier) @value.start
  (arguments) @value.end
) @_.domain

;;!! @return 123
;;!          ^^^
(return_statement
  (_) @value
) @_.domain
