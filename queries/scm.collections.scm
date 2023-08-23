;;!! (aaa (bbb) (ccc))
;;!       ^^^^^ ^^^^^
;;!   ***************
(
  (named_node
    "(" @collectionItem.iteration.start.endOf
    name: _
    _ @collectionItem
    ")" @collectionItem.iteration.end.startOf
  )
)

;;!! ((aaa) (bbb))
;;!   ^^^^^ ^^^^^
;;!   ***********
(
  (grouping
    "(" @collectionItem.iteration.start.endOf
    (_) @collectionItem
    ")" @collectionItem.iteration.end.startOf
  )
)

;; collectionItem:
;;!! [(aaa) (bbb)] @ccc
;;!   ^^^^^ ^^^^^
;;!   ***********
;; list:
;;!! [(aaa) (bbb)] @ccc
;;!  ^^^^^^^^^^^^^
;;!  ------------------
(
  (list
    "[" @list.start @collectionItem.iteration.start.endOf
    (_) @collectionItem
    "]" @list.end @collectionItem.iteration.end.startOf
  ) @list.domain
)
