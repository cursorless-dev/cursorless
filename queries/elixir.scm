(comment) @comment
(anonymous_function) @anonymousFunction
(call
  target: (_) @functionCallee
) @functionCall @functionCallee.domain

;; Map
;; %{:a => "lorem", "b" => "ipsum", 3 => "dolor"}
(map_content
  (_)? @_.leading.start.endOf
  .
  (binary_operator) @collectionItem @_.leading.end.startOf @_.trailing.start.endOf
  .
  (_)? @_.trailing.end.startOf
  (#insertion-delimiter! @collectionItem ", ")
)
(map_content
  (binary_operator
    left: (_) @collectionKey
    right: (_) @value
  ) @collectionKey.domain @value.domain
)

;; Shorthand map syntax
;; %{a: "lorem", b: "ipsum"}
(map_content
  (keywords
    (_)? @_.leading.start.endOf
    .
    (pair) @collectionItem @_.leading.end.startOf @_.trailing.start.endOf
    .
    (_)? @_.trailing.end.startOf
  )
  (#insertion-delimiter! @collectionItem ", ")
)
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
  (#match? @_target "^(def|defp|defdelegate|defguard|defguardp|defmacro|defmacrop|defn|defnp)$")
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
;; Is it better to have the class as the function iteration scope?
;; I believe `def`s can only go inside modules
;;   (call
;;     target: (identifier) @_target
;;     (#match? @_target "^(defmodule)$")
;;   ) @namedFunction.iteration @functionName.iteration
