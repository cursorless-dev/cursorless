;; function definitions
(function) @branch

;; guard equations
(guard_equation
  [
    ;; ... with a SINGLE guard
    (guards
      .
      (guard) @branch.start
      .
    )
    ;; ... with MULTIPLE guards
    (guards
      .
      (guard) @branch.start
      (guard) @branch.start
      .
    )
  ]
  .
  (_) @branch.end
) @branch.removal

;; case expressions
(exp_case
  (alts
    (alt) @branch
  )
)
