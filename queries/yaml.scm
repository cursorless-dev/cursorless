;; https://github.com/tree-sitter-grammars/tree-sitter-yaml/blob/master/src/grammar.json

;; ;;!! foo: bar
;; ;;!  ^^^  ^^^
(_
  key: (_) @collectionKey @value.leading.endOf
  value: (_) @value @collectionKey.trailing.startOf
) @_.domain

;;!! foo: bar
;;!  ^^^^^^^^
(block_mapping
  (block_mapping_pair)? @collectionItem.leading.endOf
  .
  (block_mapping_pair) @collectionItem
  .
  (block_mapping_pair)? @collectionItem.trailing.startOf
) @map

;;!! - 0
;;!    ^
;;!  ---
(
  (block_sequence
    (block_sequence_item)? @collectionItem.leading.endOf
    .
    (block_sequence_item
      "-" @collectionItem.prefix
      (_) @collectionItem
    ) @collectionItem.domain
    .
    (block_sequence_item)? @collectionItem.trailing.startOf
    (#trim-end! @collectionItem)
    (#insertion-delimiter! @collectionItem "\n")
  ) @list
  (#trim-end! @list)
)

;;!! [0]
;;!   ^
(flow_sequence
  (flow_node)? @collectionItem.leading.endOf
  .
  (flow_node) @collectionItem
  .
  (flow_node)? @collectionItem.trailing.startOf
  (#insertion-delimiter! @collectionItem ", ")
) @list

;;!! { foo: bar }
;;!    ^^^^^^^^
(flow_mapping
  (flow_pair)? @collectionItem.leading.endOf
  .
  (flow_pair) @collectionItem
  .
  (flow_pair)? @collectionItem.trailing.startOf
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
;;!! foo: | block scalar
;;!       ^^^^^^^^^^^^^
value: (_
  [
    (plain_scalar
      (string_scalar)
    )
    (block_scalar)
  ] @string @textFragment
)

;;!! foo: "bar"
;;!       ^^^^^
value: (_
  (double_quote_scalar) @string @textFragment
  (#child-range! @textFragment 0 -1 true true)
)

;;!! # comment
;;!  ^^^^^^^^^
(comment) @comment @textFragment

(block_scalar
  ">" @disqualifyDelimiter
)
