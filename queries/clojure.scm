(comment) @comment @textFragment

(str_lit) @string @textFragment

(map_lit) @map

;; A list is either a vector literal or a quoted list literal
[
  (vec_lit)
  (quoting_lit)
] @list
