(_
    name: (_) @name
) @_.domain

(augmented_assignment_expression
    left: (_) @name
) @_.domain

(assignment_expression
    left: (_) @name
) @_.domain

[
  (program)
  (formal_parameters)
] @name.iteration

(
  (_
    body: (_
        .
        "{" @name.iteration.start
        "}" @name.iteration.end
        .
    )
  )
  (#end! @name.iteration.start)
  (#start! @name.iteration.end)
)
