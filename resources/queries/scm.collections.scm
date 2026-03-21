;;!! (aaa (bbb) (ccc))
;;!       ^^^^^ ^^^^^
;;!   ***************
(named_node
  name: _
  (_) @collectionItem
)

(named_node
  "(" @collectionItem.iteration.start.endOf
  ")" @collectionItem.iteration.end.startOf
)

;;!! ((aaa) (bbb))
;;!   ^^^^^ ^^^^^
;;!   ***********
(grouping
  (_) @collectionItem
)

(grouping
  "(" @collectionItem.iteration.start.endOf
  ")" @collectionItem.iteration.end.startOf
)

;;!! [(aaa) (bbb)] @ccc
;;!   ^^^^^ ^^^^^
;;!   ***********
(list
  (_) @collectionItem
)

;;!! [(aaa) (bbb)] @ccc
;;!  ^^^^^^^^^^^^^
;;!  ------------------
(list
  "[" @list.start @collectionItem.iteration.start.endOf
  "]" @list.end @collectionItem.iteration.end.startOf
) @list.domain
