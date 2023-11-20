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

(pair
    key: (_) @collectionKey
    value: (_) @value
) @_.domain

;;!! {"bbb": 0, "ccc": 0}
;;!   ******************
(object
    "{" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
    "}" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)
