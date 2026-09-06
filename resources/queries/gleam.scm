;; Statements
[
  (let)
  (constant)
  (function)
  (type_definition)
  (function_call)
  (case)
  (todo)
] @statement

(constant
  value: (_) @value
) @_.domain

(constant
  name: (_) @name @type.leading.endOf
  type: (_) @type
) @_.domain

(let
  value: (_) @value
) @_.domain

(let
  pattern: (_) @name
) @_.domain

(list) @list
(list_pattern) @list

(data_constructor
  name: (_) @name
  arguments: (data_constructor_arguments
    [
      ;; if there is a key
      (data_constructor_argument
        label: (_) @argumentOrParameter @value.leading.endOf
        value: (_) @value @argumentOrParameter.trailing.startOf
      ) @argumentOrParameter.domain

      ;; if there's no key
      (data_constructor_argument
        value: (_) @argumentOrParameter
      )
    ]
  ) @type.iteration
) @type

(type_definition
  (type_name) @name
) @type
(type) @type

(type_alias
  (type_name) @name
  (type) @value
) @type

(function
  name: (_) @functionName @name
  body: (function_body) @namedFunction.interior
) @namedFunction @functionName.domain

(anonymous_function
  body: (_) @anonymousFunction.interior
) @anonymousFunction

(
  (function_parameters
    (_)? @argumentOrParameter.leading.endOf
    .
    (function_parameter) @argumentOrParameter
    .
    (_)? @argumentOrParameter.trailing.startOf
  ) @argumentOrParameter.iteration @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

(function_parameter
  name: (_) @type.leading.endOf @name
  type: (_) @type
) @name.domain

(
  (function_call
    function: (_) @functionCallee
    arguments: (arguments)
  ) @functionCall @functionCallee.domain
)

(
  (arguments
    (_)? @_.leading.endOf
    .
    (argument) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @argumentOrParameter.iteration @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

(case_clause
  value: (_) @branch.interior
) @branch

(case_clause
  patterns: (case_clause_patterns
    (case_clause_pattern
      (_) @condition
    )
  )
) @condition.domain

(
  (case_clause
    (case_clause_patterns
      (_)? @condition.leading.endOf
      .
      (case_clause_pattern
        (_) @condition
      )
      .
      (_)? @condition.trailing.startOf
    ) @_dummy
  ) @condition.domain @condition.iteration
  (#single-or-multi-line-delimiter! @condition @_dummy ", " ",\n")
)

(use
  value: (_) @value
) @value.domain

(use
  assignments: (use_assignments) @name
)
