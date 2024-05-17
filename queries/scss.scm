;; import css.scm

(single_line_comment) @comment @textFragment

(if_statement) @ifStatement

(mixin_statement
  (name) @functionName
) @namedFunction @functionName.domain
(function_statement
  (name) @functionName
) @namedFunction @functionName.domain
