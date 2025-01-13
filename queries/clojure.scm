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
  (_) @collectionItem.start
  .
  (_)? @_.trailing.startOf
)

(list_lit
  open: "(" @collectionItem.iteration.start.startOf
  close: ")" @collectionItem.iteration.end.endOf
) @collectionItem.iteration.domain

;;!! [foo bar]
;;!   ^^^ ^^^
(vec_lit
  (_)? @_.leading.endOf
  .
  (_) @collectionItem.start
  .
  (_)? @_.trailing.startOf
)

(vec_lit
  open: "[" @collectionItem.iteration.start.startOf
  close: "]" @collectionItem.iteration.end.endOf
) @collectionItem.iteration.domain
