(string_value) @string @textFragment

(comment) @comment @textFragment

(call_expression) @functionCall

(declaration) @collectionItem

(call_expression
  (function_name) @functionCallee
) @_.domain

(rule_set
  (selectors) @selector
) @_.domain
