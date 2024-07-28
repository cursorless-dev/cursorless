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
(parameter
  (variable_name) @name
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
