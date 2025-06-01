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

;;!! if true
;;!     ^^^^
(_
  condition: (_) @condition
) @_.domain

;;!! hi = -> { puts "Hi!" }
;;!       ^^^^^^^^^^^^^^^^^
(lambda) @anonymousFunction

;;!! [1,2,3].each do |i| end
;;!               ^^^^^^^^^^
(do_block) @anonymousFunction

(call
  receiver: (_)? @_dummy_receiver
  method: (_)? @_dummy_method
  block: (_) @anonymousFunction
  (#not-eq? @_dummy_receiver Proc)
  (#not-eq? @_dummy_method lambda)
  (#not-type? @anonymousFunction do_block)
)

;;!! Proc.new { puts "hi" }
;;!  ^^^^^^^^^^^^^^^^^^^^^^
(call
  receiver: (_) @_dummy_receiver
  method: (_) @_dummy_method
  (#eq? @_dummy_receiver Proc)
  (#eq? @_dummy_method new)
) @anonymousFunction

;;!! lambda { puts "hi" }
;;!  ^^^^^^^^^^^^^^^^^^^^
(call
  method: (_) @_dummy
  (#eq? @_dummy lambda)
) @anonymousFunction

;;!! {"1" => "one"}
;;!   ^^^
;;!          ^^^^^
(pair
  key: (_) @collectionKey @value.leading.endOf
  value: (_) @value @collectionKey.trailing.startOf
) @_.domain

;;!! {"1" => "one", "2" => "two"}
;;!   ^^^^^^^^^^^^^^^^^^^^^^^^^^
(hash
  "{" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "}" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)

;;!! return 10
;;!         ^^
(return
  (argument_list) @value
) @_.domain

;;!! a = 10
;;!      ^^
(assignment
  left: (_) @_.leading.endOf
  right: (_) @value
) @_.domain

;;!! a += 10
;;!       ^^
(operator_assignment
  left: (_) @_.leading.endOf
  right: (_) @value
) @_.domain

;;!! def foo(aaa, bbb)
;;!          ^^^  ^^^
(
  (method_parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa, bbb)
;;!      ^^^  ^^^
(
  (argument_list
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! { |aaa, bbb| }
;;!     ^^^  ^^^
(
  (block_parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! def foo(aaa, bbb)
;;!          ^^^^^^^^
(_
  (method_parameters
    "(" @argumentList.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @_dummy
  (#empty-single-multi-delimiter! @argumentList.start.endOf @_dummy "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo(aaa, bbb)
;;!      ^^^^^^^^
(_
  (argument_list
    "(" @argumentList.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @_dummy
  (#empty-single-multi-delimiter! @argumentList.start.endOf @_dummy "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! { |aaa, bbb| }
;;!     ^^^^^^^^
(_
  (block_parameters
    "|" @argumentList.start.endOf @argumentOrParameter.iteration.start.endOf
    "|" @argumentList.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @_dummy
  (#empty-single-multi-delimiter! @argumentList.start.endOf @_dummy "" ", " ",\n")
) @argumentList.domain @argumentOrParameter.iteration.domain

;; lambda_parameters
