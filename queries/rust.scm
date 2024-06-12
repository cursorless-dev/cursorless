[
  (if_expression)
  (if_let_expression)
] @ifStatement

(
  [
    (raw_string_literal)
    (string_literal)
  ] @string @textFragment
  (#child-range! @textFragment 0 -1 true true)
)

[
  (line_comment)
  (block_comment)
] @comment @textFragment
