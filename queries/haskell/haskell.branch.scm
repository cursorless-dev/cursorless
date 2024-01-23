;; branch: guard_equation
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

;; branch: exp_case
(exp_case
  (alts
    (alt) @branch
  )
)
