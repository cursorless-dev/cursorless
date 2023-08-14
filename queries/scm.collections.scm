(
  (named_node
    "(" @collectionItem.iteration.start.endOf
    name: _
    _ @collectionItem
    ")" @collectionItem.iteration.end.startOf
  )
)

(
  (grouping
    "(" @collectionItem.iteration.start.endOf
    (_) @collectionItem
    ")" @collectionItem.iteration.end.startOf
  )
)

(
  (list
    "[" @list.start @collectionItem.iteration.start.endOf
    (_) @collectionItem
    "]" @list.end @collectionItem.iteration.end.startOf
  ) @list.domain
)
