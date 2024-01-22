;; argumentOrParameter: function
(function
  patterns: (patterns
    (_) @argumentOrParameter
  )
)

;; argumentOrParameter: exp_case
(exp_case
  (alts
    (alt
      .
      (_) @argumentOrParameter
    )
  )
  .
)
