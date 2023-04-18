(comment) @comment
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
  [(method) (singleton_method)] @namedFunction
) @_.iteration

(_
  (class) @class
) @_.iteration

(_
  (class
    name: (_) @className
  ) @_.domain
) @_.iteration
