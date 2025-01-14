;; import scm.collections.scm
;; import scm.name.scm

;; https://github.com/tree-sitter-grammars/tree-sitter-query/blob/master/src/grammar.json

;; A statement is any top-level node that's not a comment
(
  (program
    (_) @statement
  ) @_.iteration
  (#not-type? @statement comment)
)

(comment) @comment @textFragment

(anonymous_node
  name: (_) @string @textFragment
)

;; functionCall:
;;!! (#aaa? @bbb "ccc")
;;!  ^^^^^^^^^^^^^^^^^^
;; functionCallee:
;;!! (#aaa? @bbb "ccc")
;;!    ^^^^
;;!  ------------------
(predicate
  name: (identifier) @functionCallee.start
  type: (predicate_type) @functionCallee.end
) @functionCall @functionCallee.domain

;;!! ((#aaa!) (#bbb!))
;;!  *****************
(grouping) @functionCall.iteration @functionCallee.iteration

;;!! (#aaa? @bbb "ccc")
;;!         ^^^^ ^^^^^
;;!  ******************
(predicate
  (parameters
    (_) @argumentOrParameter
  )
) @_.iteration

;;!! (aaa) @bbb
;;!   ^^^
;;!  ----------
(named_node
  name: _ @type
) @_.domain

;;!! "aaa" @bbb
;;!   ^^^
;;!  ----------
(anonymous_node
  name: [
    "_" @type
    (identifier
      "\"" @type.start.endOf
      "\"" @type.end.startOf
    )
  ]
) @_.domain

;;!! aaa: (bbb) @ccc
;;!  ^^^
;;!  xxxxx
;;!  ---------------
(field_definition
  name: (identifier) @collectionKey
  .
  (_) @_.trailing.startOf
) @_.domain

;;!! aaa: (bbb) @ccc
;;!       ^^^^^
;;!  ---------------
;;!! aaa: [(bbb)]* @ccc
;;!       ^^^^^^^^
;;!  ------------------
;; Note that this pattern is a bit ugly in order to exclude the capture (@foo).
;; Unfortunately the capture is part of the node to the right of the `:`, so we
;; kinda need to reach inside that node to exclude it.
(field_definition
  ":"
  (_
    [
      ")"
      "]"
    ] @value.end
    (quantifier)? @value.end
  ) @value.start.startOf
) @_.domain

;;!! aaa: "bbb" @ccc
;;!       ^^^^^
;;!  ---------------
;; As above, this pattern is a bit ugly in order to exclude the capture (@foo).
(field_definition
  ":"
  (anonymous_node
    [
      (identifier)
      "_"
    ] @value.end
    (quantifier)? @value.end
  ) @value.start.startOf
) @_.domain
