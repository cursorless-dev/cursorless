;; import css.scm

;; https://github.com/serenadeai/tree-sitter-scss/blob/master/src/grammar.json

(single_line_comment) @comment @textFragment

(if_statement) @ifStatement

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
