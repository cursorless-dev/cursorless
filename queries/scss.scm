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

;;!! replace-text($image, $color: red)
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(mixin_statement
  (name) @functionCallee @functionCallee.domain.start @functionCall.start
  (parameters) @functionCallee.domain.end @functionCall.end
)

;;!! replace-text($image, $color: red)
;;!               ^^^^^^  ^^^^^^^^^^^
(
  (parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  )
  (#insertion-delimiter! @argumentOrParameter ", ")
)

(parameters
  .
  "(" @argumentOrParameter.iteration.start.endOf
  ")" @argumentOrParameter.iteration.end.startOf
  .
) @argumentOrParameter.iteration.domain

(single_line_comment) @comment @textFragment

(if_statement) @ifStatement

(condition) @condition

(mixin_statement
  (name) @functionName @name
) @namedFunction @functionName.domain @name.domain

(function_statement
  (name) @functionName @name
) @namedFunction @functionName.domain @name.domain

(declaration
  (variable_name) @name
) @_.domain

;;!! foo($foo: 123)
;;!      ^^^^  ^^^
(parameter
  (variable_name) @name
  (default_value)? @value
) @_.domain

(stylesheet) @namedFunction.iteration @functionName.iteration
(block
  .
  "{" @namedFunction.iteration.start.endOf @functionName.iteration.start.endOf
  "}" @namedFunction.iteration.end.startOf @functionName.iteration.end.startOf
  .
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
