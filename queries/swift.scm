[
  (import_declaration)
  (property_declaration)
  (typealias_declaration)
] @statement

(function_declaration
  name: (_) @functionName
) @namedFunction @functionName.domain

(class_declaration
  name: (_) @className
) @class @className.domain

[
  (class_declaration)
  (protocol_declaration)
] @namedFunction.iteration @functionName.iteration

(array_literal) @list

(dictionary_literal) @map

(regex_literal) @regularExpression

[
  (class_declaration)
  (protocol_declaration)
  (function_declaration)
] @statement.iteration
