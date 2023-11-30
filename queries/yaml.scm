;; ;;!! foo: bar
;; ;;!  ^^^  ^^^
(_
  key: (_) @collectionKey @collectionKey.trailing.start.endOf @value.leading.start.endOf
  value: (_) @value @collectionKey.trailing.start.startOf @value.leading.start.startOf
) @_.domain

;;!! foo: bar
;;!  ^^^^^^^^
(block_mapping
  (block_mapping_pair)? @collectionItem.leading.start.endOf
  .
  (block_mapping_pair) @collectionItem @collectionItem.leading.end.startOf @collectionItem.trailing.end.endOf
  .
  (block_mapping_pair)? @collectionItem.trailing.end.startOf
) @map

;;!! - 0
;;!  ^^^
(block_sequence
  (block_sequence_item)? @collectionItem.leading.start.endOf
  .
  (block_sequence_item) @collectionItem @collectionItem.leading.end.startOf @collectionItem.trailing.end.endOf
  .
  (block_sequence_item)? @collectionItem.trailing.end.startOf
) @list

;;!! [0]
;;!   ^
(flow_sequence
  (flow_node)? @collectionItem.leading.start.endOf
  .
  (flow_node) @collectionItem @collectionItem.leading.end.startOf @collectionItem.trailing.end.endOf
  .
  (flow_node)? @collectionItem.trailing.end.startOf
  (#insertion-delimiter! @collectionItem ", ")
) @list

;;!! { foo: bar }
;;!    ^^^^^^^^
(flow_mapping
  (flow_pair)? @collectionItem.leading.start.endOf
  .
  (flow_pair) @collectionItem @collectionItem.leading.end.startOf @collectionItem.trailing.end.endOf
  .
  (flow_pair)? @collectionItem.trailing.end.startOf
  (#insertion-delimiter! @collectionItem ", ")
) @map

[
  (block_mapping)
  (block_sequence)
  (flow_sequence)
  (flow_mapping)
] @collectionItem.iteration @collectionKey.iteration @value.iteration

;;!! foo: bar
;;!       ^^^
;;!! | block scalar
;;!  ^^^^^^^^^^^^^
[
  (string_scalar)
  (block_scalar)
] @string @textFragment

;;!! # comment
;;!  ^^^^^^^^^
(comment) @comment @textFragment
