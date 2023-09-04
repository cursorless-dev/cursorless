(comment) @comment
(anonymous_function) @anonymousFunction

(call
  target: (_) @functionCallee
) @functionCall @functionCallee.domain

(keywords
  (pair
    key: (_) @collectionKey @collectionItem.trailing.end.startOf
    value: (_) @value
  ) @collectionItem @collectionItem.trailing.start.endOf
  (
    ","
  )
?
 @collectionItem.trailing.start.startOf
  (#allow-multiple! @collectionItem)
)

;; %{:a => "lorem", "b" => "ipsum", 3 => "dolor"},
(map_content
  (_)? @_.leading.start.endOf
  .
  (binary_operator
    left: (_) @collectionKey
    right: (_) @value
  ) @collectionItem @collectionKey.domain @value.domain @_.leading.end.startOf @_.trailing.start.endOf
  .
  (_)? @_.trailing.end.startOf
  (#insertion-delimiter! @collectionItem ", ")
)

(call
  target: (identifier) @_target
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
  (do_block
    .
    "do" @namedFunction.interior.start.endOf
    "end" @namedFunction.interior.end.startOf
    .
  )?
  (#match? @_target "^(def|defp|defdelegate|defguard|defguardp|defmacro|defmacrop|defn|defnp)$")
) @namedFunction @functionName.domain
