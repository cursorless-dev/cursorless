;; https://github.com/tree-sitter/tree-sitter-css/blob/master/src/grammar.json

(string_value) @string @textFragment

(comment) @comment @textFragment

(declaration) @collectionItem

(call_expression
  (function_name) @functionCallee
) @functionCall @functionCallee.domain

(rule_set
  (selectors) @selector
) @_.domain

(declaration
  (property_name) @name
) @_.domain
(attribute_selector
  (attribute_name) @name
) @_.domain

(stylesheet) @name.iteration
(block
  .
  "{" @name.iteration.start.endOf
  "}" @name.iteration.end.startOf
  .
)

(child_selector
  ">" @disqualifyDelimiter
)
