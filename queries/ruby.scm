;; https://github.com/tree-sitter/tree-sitter-ruby/blob/master/src/grammar.json

(comment) @comment @textFragment
(hash) @map
(regex) @regularExpression
(call) @functionCall

[
  (array)
  (string_array)
  (symbol_array)
] @list

(_
  (if) @ifStatement
) @_.iteration

[
  (method)
  (singleton_method)
] @namedFunction

(class) @class

(class) @namedFunction.iteration @class.iteration
(program) @namedFunction.iteration @class.iteration @className.iteration

(class) @functionName.iteration @name.iteration
(program) @functionName.iteration @name.iteration

(class
  name: (_) @className @name
) @_.domain

(string) @string

[
  (string_content)
  (heredoc_content)
] @textFragment

(method
  name: (_) @functionName @name
) @_.domain
(singleton_method
  name: (_) @functionName @name
) @_.domain

(assignment
  left: (_) @name
) @_.domain
(operator_assignment
  left: (_) @name
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
(pair
  "=>" @disqualifyDelimiter
)
(match_pattern
  "=>" @disqualifyDelimiter
)

;;!! %w(foo bar)
;;!     ^^^ ^^^
(
  (string_array
    (bare_string)? @_.leading.endOf
    .
    (bare_string) @collectionItem
    .
    (bare_string)? @_.trailing.startOf
  )
  (#insertion-delimiter! @collectionItem " ")
)

;;!! %i(foo bar)
;;!     ^^^ ^^^
(
  (symbol_array
    (bare_symbol)? @_.leading.endOf
    .
    (bare_symbol) @collectionItem
    .
    (bare_symbol)? @_.trailing.startOf
  )
  (#insertion-delimiter! @collectionItem " ")
)
