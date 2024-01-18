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
          name: (variable) @functionName @name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @namedFunction @functionName.domain @name.domain
      (#not-eq? @_previous @name)
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @functionName @name
          ) @namedFunction.start @functionName.domain.start @name.domain.start
          (#not-eq? @_previous @name)
        )
        (
          (function
              name: (variable) @functionName @name
          ) @namedFunction.start @functionName.domain.start @name.domain.start
          (#not-eq? @_previous @name)
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @namedFunction.end @functionName.domain.end @name.domain.end
        (#eq? @name @_end_name)
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
      (#not-eq? @_next @name)
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
          name: (variable) @functionName @name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @namedFunction @functionName.domain @name.domain
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @functionName @name
          ) @namedFunction.start @functionName.domain.start @name.domain.start
        )
        (
          (function
              name: (variable) @functionName @name
          ) @namedFunction.start @functionName.domain.start @name.domain.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @namedFunction.end @functionName.domain.end @name.domain.end
        (#eq? @name @_end_name)
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
      (#not-eq? @_next @name)
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
        name: (variable) @functionName @name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @namedFunction @functionName.domain @name.domain
    (#not-eq? @_previous @name)
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
  (
    [
      (
        (signature
              name: (variable) @functionName @name
        ) @namedFunction.start @functionName.domain.start @name.domain.start
        (#not-eq? @_previous @name)
      )
      (
        (function
            name: (variable) @functionName @name
        ) @namedFunction.start @functionName.domain.start @name.domain.start
        (#not-eq? @_previous @name)
      )
    ]
    .
    (function)*
    .
    (
      (function
          name: (variable) @_end_name
      ) @namedFunction.end @functionName.domain.end @name.domain.end
      (#eq? @name @_end_name)
    )
  )
  .
)
;; ... as the ONLY in the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  .
  ;; function declaration
  (
    (function
        name: (variable) @functionName @name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @namedFunction @functionName.domain @name.domain
  )
  .
)
;; ... as the ONLY in the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  .
  ;; function declaration
  (
    [
      (
        (signature
              name: (variable) @functionName @name
        ) @namedFunction.start @functionName.domain.start @name.domain.start
      )
      (
        (function
            name: (variable) @functionName @name
        ) @namedFunction.start @functionName.domain.start @name.domain.start
      )
    ]
    .
    (function)*
    .
    (
      (function
          name: (variable) @_end_name
      ) @namedFunction.end @functionName.domain.end @name.domain.end
      (#eq? @name @_end_name)
    )
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
          name: (variable) @functionName @name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @namedFunction @functionName.domain @name.domain
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @functionName @name
          ) @namedFunction.start @functionName.domain.start @name.domain.start
        )
        (
          (function
              name: (variable) @functionName @name
          ) @namedFunction.start @functionName.domain.start @name.domain.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @namedFunction.end @functionName.domain.end @name.domain.end
        (#eq? @name @_end_name)
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
      (#not-eq? @_next @name)
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
        name: (variable) @functionName @name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @namedFunction @functionName.domain @name.domain
    (#not-eq? @_previous @name)
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
              name: (variable) @functionName @name
        ) @namedFunction.start @functionName.domain.start @name.domain.start
        (#not-eq? @_previous @name)
      )
      (
        (function
            name: (variable) @functionName @name
        ) @namedFunction.start @functionName.domain.start @name.domain.start
        (#not-eq? @_previous @name)
      )
    ]
    .
    (function)*
    .
    (
      (function
          name: (variable) @_end_name
      ) @namedFunction.end @functionName.domain.end @name.domain.end
      (#eq? @name @_end_name)
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
        name: (variable) @functionName @name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @namedFunction @functionName.domain @name.domain
  )
  .
)
;; ... as the ONLY in the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  .
  ;; function declaration
  (
    [
      (
        (signature
              name: (variable) @functionName @name
        ) @namedFunction.start @functionName.domain.start @name.domain.start
      )
      (
        (function
            name: (variable) @functionName @name
        ) @namedFunction.start @functionName.domain.start @name.domain.start
      )
    ]
    .
    (function)*
    .
    (
      (function
          name: (variable) @_end_name
      ) @namedFunction.end @functionName.domain.end @name.domain.end
      (#eq? @name @_end_name)
    )
  )
  .
)