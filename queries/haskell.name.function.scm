;; function declaration
(
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @name @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @name.domain
      (#not-eq? @_previous @_start_name)
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @name @_start_name
          ) @name.domain.start
          (#not-eq? @_previous @_start_name)
        )
        (
          (function
              name: (variable) @name @_start_name
          ) @name.domain.start
          (#not-eq? @_previous @_start_name)
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @name.domain.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the START of the file
(haskell
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @name @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @name.domain
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @name @_start_name
          ) @name.domain.start
        )
        (
          (function
              name: (variable) @name @_start_name
          ) @name.domain.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @name.domain.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the END of the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    (function
        name: (variable) @name @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @name.domain
    (#not-eq? @_previous @_start_name)
  )
  .
)
;; ... at the END of the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @name @_start_name
      ) @name.domain.start
      (#not-eq? @_previous @_start_name)
    )
    (
      (function
          name: (variable) @name @_start_name
      ) @name.domain.start
      (#not-eq? @_previous @_start_name)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @name.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @name @_start_name
      ) @name.domain.start
      (#not-eq? @_previous @_start_name)
    )
    (
      (function
          name: (variable) @name @_start_name
      ) @name.domain.start
      (#not-eq? @_previous @_start_name)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @name.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)
;; ... as the ONLY in the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  .
  ;; function declaration
  (function
      name: (variable) @name @_start_name
  ) @name.domain
  .
)
;; ... as the ONLY in the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @name @_start_name
      ) @name.domain.start
    )
    (
      (function
          name: (variable) @name @_start_name
      ) @name.domain.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @name.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)
;; ... at the START of the clause
(decls
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @name @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @name.domain
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @name @_start_name
          ) @name.domain.start
        )
        (
          (function
              name: (variable) @name @_start_name
          ) @name.domain.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @name.domain.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the END of the clause
;; ... without SIGNATURE and with SINGLE declaration
(decls
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    (function
        name: (variable) @name @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @name.domain
    (#not-eq? @_previous @_start_name)
  )
  .
)
;; ... at the END of the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    [
      (
        (signature
              name: (variable) @name @_start_name
        ) @name.domain.start
        (#not-eq? @_previous @_start_name)
      )
      (
        (function
            name: (variable) @name @_start_name
        ) @name.domain.start
        (#not-eq? @_previous @_start_name)
      )
    ]
    .
    (function)*
    .
    (
      (function
          name: (variable) @_end_name
      ) @name.domain.end
      (#eq? @_start_name @_end_name)
    )
  )
  .
)
;; ... as the ONLY in the clause
;; ... without SIGNATURE and with SINGLE declaration
(decls
  .
  ;; function declaration
  (
    (function
        name: (variable) @name @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @name.domain
  )
  .
)
;; ... as the ONLY in the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @name @_start_name
      ) @name.domain.start
    )
    (
      (function
          name: (variable) @name @_start_name
      ) @name.domain.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @name.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)
