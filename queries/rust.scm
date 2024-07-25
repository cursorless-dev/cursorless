;; https://github.com/tree-sitter/tree-sitter-rust/blob/master/src/grammar.json

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

[
  (struct_item
    name: (_) @className
  )
  (enum_item
    name: (_) @className
  )
] @class @className.domain

(struct_expression) @class

(trait_item
  name: (_) @className
) @_.domain

(function_item
  name: (_) @functionName
) @namedFunction @functionName.domain

[
  (call_expression)
  (macro_invocation)
  (struct_expression)
] @functionCall

(call_expression
  function: (_) @functionCallee
) @_.domain

(closure_expression) @anonymousFunction

[
  (array_expression)
  (tuple_expression)
] @list

(match_expression
  value: (_) @private.switchStatementSubject
) @_.domain

operator: [
  "<"
  "<<"
  "<<="
  "<="
  ">"
  ">="
  ">>"
  ">>="
] @disqualifyDelimiter
(function_item
  "->" @disqualifyDelimiter
)
(match_arm
  "=>" @disqualifyDelimiter
)
(macro_rule
  "=>" @disqualifyDelimiter
)
