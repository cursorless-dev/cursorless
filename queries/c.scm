(if_statement) @ifStatement

(
  (string_literal) @string @textFragment
  (#child-range! @textFragment 0 -1 true true)
)
(comment) @comment @textFragment
