;;!! "string"
;;!   ^^^^^^
(string_content) @textFragment

;;!! {"value": 0}
;;!  ^^^^^^^^^^^^
(object) @map

;;!! [0]
;;!  ^^^
(array) @list

;;!! "string"
;;!  ^^^^^^^^
(string) @string

;;!! {"value": 0}
;;!   ^^^^^^^  ^
;;!   ----------
(pair
  key: (_) @collectionKey @collectionKey.trailing.start.endOf @value.leading.start.endOf
  value: (_) @value @collectionKey.trailing.end.startOf @value.leading.end.startOf
) @_.domain

;;!! {"bbb": 0, "ccc": 0}
;;!   ******************
(object
  "{" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "}" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)
