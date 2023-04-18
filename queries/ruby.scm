(comment) @comment
(if) @ifStatement
(call) @functionCall
(class [(method) (singleton_method)] @namedFunction) @namedFunction.iteration
(hash) @map

[
  (array)
  (string_array)
  (symbol_array)
] @list

(regex) @regularExpression

(class) @class
(class name: (_) @className) @domain
