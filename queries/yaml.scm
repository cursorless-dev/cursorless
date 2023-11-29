;;!! foo: bar
;;!  ^^^  ^^^
(_
    key: (_) @collectionKey @collectionKey.trailing.start.endOf @value.leading.start.endOf
    value: (_) @value @collectionKey.trailing.start.startOf @value.leading.start.startOf
) @collectionItem @_.domain

(block_mapping) @collectionItem.iteration @collectionKey.iteration @value.iteration

(flow_pair) @collectionItem

;;!! languageId: plauintext
;;!              ^^^^^^^^^^
(string_scalar) @string @textFragment

;;!! # comment
;;!  ^^^^^^^^^
(comment) @comment @textFragment

;;!! | block scalar
(block_scalar) @textFragment

;;!! { foo: bar }
;;!  ^^^^^^^^^^^^
(flow_mapping) @map
(flow_mapping) @collectionItem.iteration @collectionKey.iteration @value.iteration

[
    ;;!! - 0\n- 1
    ;;!  ^^^^^^^^
    (block_sequence)
    ;;!! [0, 1]
    ;;!  ^^^^^^
    (flow_sequence)
] @list @collectionItem.iteration

;;!! - 0
;;!  ^^^
(block_sequence_item) @collectionItem

;;!! [0]
;;!   ^
(flow_sequence
    (flow_node) @collectionItem
)
