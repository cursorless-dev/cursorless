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
          name: (variable) @functionName @name.function @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @name.function @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @namedFunction @functionName.domain @name.function.domain
      (#not-eq? @_previous @name.function)
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @functionName @name.function
          ) @namedFunction.start @functionName.domain.start @name.function.domain.start
          (#not-eq? @_previous @name.function)
        )
        (
          (function
              name: (variable) @functionName @name.function
          ) @namedFunction.start @functionName.domain.start @name.function.domain.start
          (#not-eq? @_previous @name.function)
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @namedFunction.end @functionName.domain.end @name.function.domain.end
        (#eq? @name.function @_end_name)
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
      (#not-eq? @_next @name.function)
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
          name: (variable) @functionName @name.function @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @name.function @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @namedFunction @functionName.domain @name.function.domain
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @functionName @name.function
          ) @namedFunction.start @functionName.domain.start @name.function.domain.start
        )
        (
          (function
              name: (variable) @functionName @name.function
          ) @namedFunction.start @functionName.domain.start @name.function.domain.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @namedFunction.end @functionName.domain.end @name.function.domain.end
        (#eq? @name.function @_end_name)
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
      (#not-eq? @_next @name.function)
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
        name: (variable) @functionName @name.function @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @name.function @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @namedFunction @functionName.domain @name.function.domain
    (#not-eq? @_previous @name.function)
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
            name: (variable) @functionName @name.function
      ) @namedFunction.start @functionName.domain.start @name.function.domain.start
      (#not-eq? @_previous @name.function)
    )
    (
      (function
          name: (variable) @functionName @name.function
      ) @namedFunction.start @functionName.domain.start @name.function.domain.start
      (#not-eq? @_previous @name.function)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @namedFunction.end @functionName.domain.end @name.function.domain.end
    (#eq? @name.function @_end_name)
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
            name: (variable) @functionName @name.function
      ) @namedFunction.start @functionName.domain.start @name.function.domain.start
      (#not-eq? @_previous @name.function)
    )
    (
      (function
          name: (variable) @functionName @name.function
      ) @namedFunction.start @functionName.domain.start @name.function.domain.start
      (#not-eq? @_previous @name.function)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @namedFunction.end @functionName.domain.end @name.function.domain.end
    (#eq? @name.function @_end_name)
  )
  .
)
;; ... as the ONLY in the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  .
  ;; function declaration
  (function
      name: (variable) @functionName @name.function
  ) @namedFunction @functionName.domain @name.function.domain
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
            name: (variable) @functionName @name.function
      ) @namedFunction.start @functionName.domain.start @name.function.domain.start
    )
    (
      (function
          name: (variable) @functionName @name.function
      ) @namedFunction.start @functionName.domain.start @name.function.domain.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @namedFunction.end @functionName.domain.end @name.function.domain.end
    (#eq? @name.function @_end_name)
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
          name: (variable) @functionName @name.function @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @name.function @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @namedFunction @functionName.domain @name.function.domain
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @functionName @name.function
          ) @namedFunction.start @functionName.domain.start @name.function.domain.start
        )
        (
          (function
              name: (variable) @functionName @name.function
          ) @namedFunction.start @functionName.domain.start @name.function.domain.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @namedFunction.end @functionName.domain.end @name.function.domain.end
        (#eq? @name.function @_end_name)
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
      (#not-eq? @_next @name.function)
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
        name: (variable) @functionName @name.function @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @name.function @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @namedFunction @functionName.domain @name.function.domain
    (#not-eq? @_previous @name.function)
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
              name: (variable) @functionName @name.function
        ) @namedFunction.start @functionName.domain.start @name.function.domain.start
        (#not-eq? @_previous @name.function)
      )
      (
        (function
            name: (variable) @functionName @name.function
        ) @namedFunction.start @functionName.domain.start @name.function.domain.start
        (#not-eq? @_previous @name.function)
      )
    ]
    .
    (function)*
    .
    (
      (function
          name: (variable) @_end_name
      ) @namedFunction.end @functionName.domain.end @name.function.domain.end
      (#eq? @name.function @_end_name)
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
        name: (variable) @functionName @name.function @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @name.function @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @namedFunction @functionName.domain @name.function.domain
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
            name: (variable) @functionName @name.function
      ) @namedFunction.start @functionName.domain.start @name.function.domain.start
    )
    (
      (function
          name: (variable) @functionName @name.function
      ) @namedFunction.start @functionName.domain.start @name.function.domain.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @namedFunction.end @functionName.domain.end @name.function.domain.end
    (#eq? @name.function @_end_name)
  )
  .
)
