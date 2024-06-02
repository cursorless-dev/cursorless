(comment) @comment @textFragment
(hash) @map
(regex) @regularExpression
(call) @functionCall

[
  (array)
  (string_array)
  (symbol_array)
] @list

(_
  (if) @ifStatement
) @_.iteration

(_
  [
    (method)
    (singleton_method)
  ] @namedFunction
) @_.iteration

(_
  (class) @class
) @_.iteration

(_
  (class
    name: (_) @className
  ) @_.domain
) @_.iteration

(string) @string

[
  (string_content)
  (heredoc_content)
] @textFragment

(class
  name: (_) @name
) @_.domain

(method
  name: (_) @functionName @name
) @_.domain
(singleton_method
  name: (_) @functionName @name
) @_.domain

(assignment
  left: (_) @name
) @_.domain
(operator_assignment
  left: (_) @name
) @_.domain
