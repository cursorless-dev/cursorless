;; https://github.com/sogaiu/tree-sitter-clojure/blob/master/src/grammar.json

(comment) @comment @textFragment

(str_lit) @string @textFragment

(map_lit) @map

;; A list is either a vector literal or a quoted list literal
(vec_lit) @list

(quoting_lit
  (list_lit)
) @list

;;!! '(foo bar)
;;!    ^^^ ^^^
(list_lit
  (_)? @_.leading.endOf
  .
  (_) @collectionItem
  .
  (_)? @_.trailing.startOf
)

(list_lit
  open: "(" @collectionItem.iteration.start.endOf
  close: ")" @collectionItem.iteration.end.startOf
) @collectionItem.iteration.domain

;;!! [foo bar]
;;!   ^^^ ^^^
(vec_lit
  (_)? @_.leading.endOf
  .
  (_) @collectionItem
  .
  (_)? @_.trailing.startOf
)

(vec_lit
  open: "[" @collectionItem.iteration.start.endOf
  close: "]" @collectionItem.iteration.end.startOf
) @collectionItem.iteration.domain

;; Keyword follow by a value
(map_lit
  (_)? @_.leading.endOf
  .
  (kwd_lit) @collectionItem.start
  .
  value: (_) @collectionItem.end
  .
  (_)? @_.trailing.startOf
)

;; Keyword followed by comment or closing brace
(map_lit
  (_)? @_.leading.endOf
  .
  (kwd_lit) @collectionItem.start
  .
  [
    (comment) @_.trailing.startOf
    "}"
  ]
)

;; Non keyword value that is not preceded by a keyword. eg a string literal.
(map_lit
  _ @_dummy
  .
  value: (_) @collectionItem
  (#not-type? @_dummy "kwd_lit")
  (#not-type? @collectionItem "kwd_lit")
)

(map_lit
  open: "{" @collectionItem.iteration.start.endOf
  close: "}" @collectionItem.iteration.end.startOf
) @collectionItem.iteration.domain

;;!! (foo)
;;!  ^^^^^
(
  (list_lit
    .
    value: (_) @functionCallee
  ) @functionCall @functionCallee.domain @argumentOrParameter.iteration
  ;; A function call is a list literal which is not quoted
  (#not-parent-type? @functionCall quoting_lit)
)

;;!! (foo :bar)
;;!       ^^^^
(
  (list_lit
    .
    value: (_)
    value: (_) @argumentOrParameter
  ) @_dummy
  (#not-parent-type? @_dummy quoting_lit)
)

;;!! (defn foo [] 5)
;;!  ^^^^^^^^^^^^^^^
;;!        ^^^
(
  (list_lit
    .
    value: (_) @_dummy
    .
    value: (_) @name
  ) @namedFunction @name.domain
  (#text? @_dummy defn defmacro)
  (#not-parent-type? @namedFunction quoting_lit)
)

;;!! (fn [] 5)
;;!  ^^^^^^^^^
(
  (list_lit
    .
    value: (_) @_dummy
  ) @anonymousFunction
  (#text? @_dummy fn)
  (#not-parent-type? @anonymousFunction quoting_lit)
)

;;!! #(+ 1 1)
;;!  ^^^^^^^^
(anon_fn_lit) @anonymousFunction

;;!! (if true "hello")
;;!  ^^^^^^^^^^^^^^^^^
;;!      ^^^^
(
  (list_lit
    .
    value: (_) @_dummy
    .
    value: (_) @condition
  ) @ifStatement @condition.domain
  (#text? @_dummy "if" "if-let" "when" "when-let")
  (#not-parent-type? @ifStatement quoting_lit)
)

;;!! {:foo 1, :bar 2}
;;!   ^^^^    ^^^^
;;!        ^       ^
(map_lit
  value: (_) @collectionKey @collectionKey.domain.start @value.domain.start
  value: (_) @value @collectionKey.domain.end @value.domain.end
  (#even? @collectionKey value)
  (#odd? @value value)
)

;;!! {:foo 1, :bar 2}
;;!   ^^^^^^^^^^^^^^
(map_lit
  "{" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "}" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)
