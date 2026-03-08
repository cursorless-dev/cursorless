;; https://github.com/tree-sitter/tree-sitter-json/blob/master/src/grammar.json

;;!! {"value": 0}
;;!  ^^^^^^^^^^^^
(object) @map

;;!! [0]
;;!  ^^^
(array) @list

;;!! "string"
;;!  ^^^^^^^^
(string) @string

;;!! "string"
;;!   ^^^^^^
(string_content) @textFragment

;;!! // aaa
;;!  ^^^^^^
;;!! /* aaa */
;;!  ^^^^^^^^^
(comment) @comment @textFragment

;;!! {"value": 0}
;;!   ^^^^^^^  ^
;;!   ----------
(pair
  key: (_) @collectionKey @value.leading.endOf
  value: (_) @value @collectionKey.trailing.startOf
) @_.domain

;;!! {"bbb": 0, "ccc": 0}
;;!   ******************
(object
  "{" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "}" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)
