(comment) @comment @textFragment
(string) @string @textFragment
(anonymous_function) @anonymousFunction
(call
  target: (_) @functionCallee
) @functionCall @functionCallee.domain

;; Map
;; %{:a => "lorem", "b" => "ipsum", 3 => "dolor"}
(
  (map_content
    (_)? @_.leading.endOf
    .
    (binary_operator) @collectionItem
    .
    (_)? @_.trailing.startOf
  ) @dummy
  (#single-or-multi-line-delimiter! @collectionItem @dummy ", " ",\n")
)
(map_content
  (binary_operator
    left: (_) @collectionKey
    right: (_) @value
  ) @collectionKey.domain @value.domain
)

;; Shorthand map syntax
;; %{a: "lorem", b: "ipsum"}
(
  (map_content
    (keywords
      (_)? @_.leading.endOf
      .
      (pair) @collectionItem
      .
      (_)? @_.trailing.startOf
    )
    (#single-or-multi-line-delimiter! @collectionItem @dummy ", " ",\n")
  ) @dummy
)

(map_content) @collectionItem.iteration @collectionKey.iteration @value.iteration

(map_content
  (keywords
    (pair
      key: (_) @collectionKey
      value: (_) @value
    ) @collectionKey.domain @value.domain
  )
)

(call
  target: (identifier) @_target
  (#match? @_target "^(def|defp|defdelegate|defmacro|defmacrop|defn|defnp)$")
  (arguments
    [
      ; zero-arity functions with no parentheses
      (identifier) @functionName
      ; regular function clause
      (call
        target: (identifier) @functionName
      )
      ; function clause with a guard clause
      (binary_operator
        left: (call
          target: (identifier) @functionName
        )
        operator: "when"
      )
    ]
  )
  (do_block) @namedFunction.interior
  (#shrink-to-match! @namedFunction.interior "^do\\n?\\w*(?<keep>.*?\\n)\\s*end$")
) @namedFunction @functionName.domain

;; def fun(), do: 1
(call
  target: (identifier) @_target
  (#match? @_target "^(def|defp|defdelegate|defmacro|defmacrop|defn|defnp)$")
  (arguments
    (keywords
      (pair
        key: (_) @do_keyword
        value: (_) @namedFunction.interior
      )
    )
    (#match? @do_keyword "^do: $")
  )
) @namedFunction @functionName.domain

;; defguard guard(term) when is_integer(term) and rem(term, 2) == 0
(call
  target: (identifier) @_target
  (#match? @_target "^(defguard|defguardp)$")
  (arguments
    (binary_operator
      left: (call
        target: (identifier) @functionName
      )
      operator: "when"
    )
  )
) @namedFunction @functionName.domain

(call
  target: (identifier) @_target
  (#match? @_target "^(defmodule)$")
  (arguments
    (alias) @className
  )
  (do_block
    .
    "do" @class.interior.start.endOf
    "end" @class.interior.end.startOf
    .
  )
) @class @className.domain

(source) @className.iteration @class.iteration
(source) @statement.iteration
(source) @namedFunction.iteration @functionName.iteration
(call
  target: (identifier) @_target
  (#match? @_target "^(defmodule)$")
) @namedFunction.iteration @functionName.iteration
