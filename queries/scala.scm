(if_expression) @ifStatement

[
  (string)
  (interpolated_string_expression)
] @string @textFragment

(comment) @comment @textFragment

;; treating classes = classlike
[
  (class_definition
    name: (_) @className
  )
  (object_definition
    name: (_) @className
  )
  (trait_definition
    name: (_) @className
  )
] @_.domain @class

;; list.size(), does not count foo.size (field_expression), or foo size (postfix_expression)
(call_expression) @functionCall

(lambda_expression) @anonymousFunction

(function_definition
  name: (_) @functionName
) @_.domain @namedFunction

(match_expression
  value: (_) @private.switchStatementSubject
) @_.domain

(_
  name: (_) @name
) @_.domain
(_
  pattern: (_) @name
) @_.domain
