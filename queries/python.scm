(
  (function_definition
    name: (_) @functionName
    body: (_) @namedFunction.interior
  ) @namedFunction @functionName.domain
  (#not-parent-type? @namedFunction decorated_definition)
)
(decorated_definition
  (function_definition
    name: (_) @functionName
    body: (_) @namedFunction.interior
  )
) @namedFunction @functionName.domain

(
  (class_definition
    name: (_) @className
    body: (_) @class.interior
  ) @class @className.domain
  (#not-parent-type? @class decorated_definition)
)
(decorated_definition
  (class_definition
    name: (_) @className
    body: (_) @class.interior
  )
) @class @className.domain

(module) @className.iteration @class.iteration
(module) @statement.iteration
(module) @namedFunction.iteration @functionName.iteration
(class_definition) @namedFunction.iteration @functionName.iteration
(_
  body: (_) @statement.iteration
)
