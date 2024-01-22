;; argumentOrParameter.iteration: function
(function) @argumentOrParameter.iteration

;; argumentOrParameter.iteration: guard_equation
(guard_equation
  [
    ;; ... with a SINGLE guard
    (guards
      .
      (guard) @argumentOrParameter.iteration.start
      .
    )
    ;; ... with MULTIPLE guards
    (guards
      .
      (guard) @argumentOrParameter.iteration.start
      (guard) @argumentOrParameter.iteration.start
      .
    )
  ]
  .
  (_) @argumentOrParameter.iteration.end
) @argumentOrParameter.iteration.removal

;; argumentOrParameter.iteration: exp_case
(exp_case
  (alts
    (alt) @argumentOrParameter.iteration
  )
)
