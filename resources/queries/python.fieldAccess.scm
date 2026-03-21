;;!! foo.bar
;;!  ^^^
(
  (attribute
    object: (_) @private.fieldAccess
  )
  (#not-type? @private.fieldAccess call attribute subscript)
)

;;!! foo().bar
;;!  ^^^^^
(
  (attribute
    object: (call
      function: (_) @_dummy
    ) @private.fieldAccess
  )
  (#not-type? @_dummy attribute)
)

;;!! foo[0].bar
;;!  ^^^^^^
(
  (attribute
    object: (subscript
      value: (_) @_dummy
    ) @private.fieldAccess
  )
  (#not-type? @_dummy attribute)
)

;;!! foo.bar
;;!     ^^^^
(
  (attribute
    "." @private.fieldAccess.start
    attribute: (_) @private.fieldAccess.end
  ) @_dummy
  (#not-parent-type? @_dummy call subscript)
)

;;!! foo.bar()
;;!     ^^^^^^
(call
  function: (attribute
    "." @private.fieldAccess.start
  )
  arguments: (_) @private.fieldAccess.end
)

;;!! foo.bar[0]
;;!     ^^^^^^^
(subscript
  value: (attribute
    "." @private.fieldAccess.start
  )
  "]" @private.fieldAccess.end
)

;;!! foo[bar.baz]
;;!         ^^^^
;; The reason we need this special treatment for subscript is that
;; the attribute inside the subscript of the subscript is a
;; direct child of the subscript, so will be ruled out by the
;; `foo.bar` pattern above.  Note that this is not the case for `call`,
;; where the arguments get their own parent node, and are thus not direct children
;; of the call.
(subscript
  subscript: (attribute
    "." @private.fieldAccess.start
    attribute: (_) @private.fieldAccess.end
  )
)

;; Use the largest attribute, call, or subscript
;; in a chain of such ancestors as the iteration scope.
(
  [
    (attribute)
    (call)
    (subscript)
  ] @private.fieldAccess.iteration
  (#not-parent-type? @private.fieldAccess.iteration attribute call subscript)
)

;; Use the interior of the `[]` in a subscript as an iteration scope
(subscript
  subscript: [
    (attribute)
    (call)
    (subscript)
  ] @private.fieldAccess.iteration
)
