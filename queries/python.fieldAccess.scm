;; foo.bar
;; ^^^
(
  (attribute
    object: (_) @fieldAccess
  )
  (#not-type? @fieldAccess call attribute subscript)
)

;; foo().bar
;; ^^^^^
(
  (attribute
    object: (call
      function: (_) @dummy
    ) @fieldAccess
  )
  (#not-type? @dummy attribute)
)

;; foo[0].bar
;; ^^^^^^
(
  (attribute
    object: (subscript
      value: (_) @dummy
    ) @fieldAccess
  )
  (#not-type? @dummy attribute)
)

;; foo.bar
;;    ^^^^
(
  (attribute
    "." @fieldAccess.start
    attribute: (_) @fieldAccess.end
  ) @dummy
  (#not-parent-type? @dummy call subscript)
)

;; foo.bar()
;;    ^^^^^^
(call
  function: (attribute
    "." @fieldAccess.start
  )
  arguments: (_) @fieldAccess.end
)

;; foo.bar[0]
;;    ^^^^^^^
(subscript
  value: (attribute
    "." @fieldAccess.start
  )
  "]" @fieldAccess.end
)

;; foo[bar.baz]
;;        ^^^^
;; The reason we need this special treatment for subscript is that
;; the attribute inside the subscript of the subscript is a
;; direct child of the subscript, so will be ruled out by the
;; `foo.bar` pattern above.  Note that this is not the case for `call`,
;; where the arguments get their own parent node, and are thus not direct children
;; of the call.
(subscript
  subscript: (attribute
    "." @fieldAccess.start
    attribute: (_) @fieldAccess.end
  )
)

;; Use the largest attribute, call, or subscript
;; in a chain of such ancestors as the iteration scope.
(
  [(attribute) (call) (subscript)] @fieldAccess.iteration
  (#not-parent-type? @fieldAccess.iteration attribute call subscript)
)

;; Use the interior of the `[]` in a subscript as an iteration scope
(subscript
  subscript: [(attribute) (call) (subscript)] @fieldAccess.iteration
)
