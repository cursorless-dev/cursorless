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