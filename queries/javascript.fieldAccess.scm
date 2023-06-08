;; foo.bar
;; ^^^
(
  (member_expression
    object: (_) @fieldAccess
  )
  (#not-type? @fieldAccess call_expression member_expression subscript_expression)
)

;; foo().bar
;; ^^^^^
(
  (member_expression
    object: (call_expression
      function: (_) @dummy
    ) @fieldAccess
  )
  (#not-type? @dummy member_expression)
)

;; foo[0].bar
;; ^^^^^^
(
  (member_expression
    object: (subscript_expression
      object: (_) @dummy
    ) @fieldAccess
  )
  (#not-type? @dummy member_expression)
)

;; foo.bar
;;    ^^^^
(
  (member_expression
    ["." (optional_chain)] @fieldAccess.start
    property: (_) @fieldAccess.end
  ) @dummy
  (#not-parent-type? @dummy call_expression subscript_expression)
)

;; foo.bar()
;;    ^^^^^^
(call_expression
  function: (member_expression
    ["." (optional_chain)] @fieldAccess.start
  )
  arguments: (_) @fieldAccess.end
)

;; foo.bar[0]
;;    ^^^^^^^
(subscript_expression
  object: (member_expression
    ["." (optional_chain)] @fieldAccess.start
  )
  "]" @fieldAccess.end
)

;; foo[bar.baz]
;;        ^^^^
;; The reason we need this special treatment for subscript_expression is that
;; the member_expression inside the index of the subscript_expression is a
;; direct child of the subscript_expression, so will be ruled out by the
;; `foo.bar` pattern above.  Note that this is not the case for `call_expression`,
;; where the arguments get their own parent node, and are thus not direct children
;; of the call_expression.
(subscript_expression
  index: (member_expression
    ["." (optional_chain)] @fieldAccess.start
    property: (_) @fieldAccess.end
  )
)

;; Use the largest member_expression, call_expression, or subscript_expression
;; in a chain of such ancestors as the iteration scope.
(
  [(member_expression) (call_expression) (subscript_expression)] @fieldAccess.iteration
  (#not-parent-type? @fieldAccess.iteration member_expression call_expression subscript_expression)
)

;; Use the interior of the `[]` in a subscript_expression as an iteration scope
(subscript_expression
  index: [(member_expression) (call_expression) (subscript_expression)] @fieldAccess.iteration
)
