;; function definitions
(function
  rhs: (_) @value
) @branch

;; guard equations
(guard_equation
  [
    ;; ... with a SINGLE guard
    (guards
      .
      (guard) @branch.start @condition @condition.domain.start
      .
    )
    ;; ... with MULTIPLE guards
    (guards
      .
      (guard) @branch.start @condition.start @condition.domain.start
      (guard) @branch.start @condition.end @condition.domain.start
      .
    )
  ]
  .
  (_) @branch.end @condition.domain.end @value
) @branch.removal

;; case expressions
(exp_case
  (_) @condition
  .
  (alts
    (alt
      .
      (_) @argumentOrParameter
      (_) @value
      .
    ) @branch
  )
  .
)
