;; https://github.com/tree-sitter-grammars/tree-sitter-lua/blob/main/src/grammar.json

;; Statements
[
  (variable_declaration)
  (break_statement)
  (do_statement)
  (empty_statement)
  (for_statement)
  (goto_statement)
  (if_statement)
  (label_statement)
  (repeat_statement)
  (return_statement)
  (while_statement)
] @statement

;; Only treat function declarions and calls as statements if they
;; aren't part of assignments, etc
(
  [
    (function_declaration)
    (function_call)
  ] @statement
  (#not-parent-type? @statement expression_list)
)
[
  (block)
  (chunk)
] @statement.iteration @namedFunction.iteration @functionCall.iteration

;; Duplicate above due to 3 label node limit
[
  (block)
  (chunk)
] @ifStatement.iteration @value.iteration @name.iteration

;; Capture assignment only if without variable prefix
;;!! count = count + 1
;;!  ^^^^^^^^^^^^^^^^^
(
  (assignment_statement) @statement
  (#not-parent-type? @statement variable_declaration)
)

;; Conditionals
;;!! if x < y then
;;!  ---^^^^^-----
;;!  ---xxxxxx----
;;!! end
;;!  ---
(if_statement
  _ @condition.domain.start.startOf
  condition: (_) @condition
  consequence: (_)
  !alternative
  "end" @condition.domain.end.endOf
)

;;!! if x < y then
;;!  ---^^^^^-----
;;!  ---xxxxxx----
;;!! elseif x < y then
(if_statement
  _ @_.domain.start.startOf
  condition: (_) @condition
  consequence: (_) @_.domain.end.endOf
  alternative: (_)
)

;;!! elseif x < y then
;;!  -------^^^^^-----
;;!  -------xxxxxx----
(elseif_statement
  condition: (_) @condition
) @_.domain

;;!!
(if_statement
  "if" @branch.start
  consequence: (_) @branch.end @branch.interior
) @ifStatement @branch.iteration @condition.iteration

;;!! if x < y then
;;!!     print("x smaller")
;;!! else
;;!  ^^^^
;;!!     print("x bigger")
;;!      ^^^^^^^^^^^^^^^^^
;;!! end
[
  (elseif_statement
    consequence: (_) @branch.interior
  )
  (else_statement
    body: (_) @branch.interior
  )
] @branch @_.domain

;;!! while i <= 5 do
;;!        ^^^^^^
;;!        xxxxxx
(while_statement
  condition: (_) @condition
) @_.domain

;;!! repeat
;;!! ...
;;!! until i > 5
;;!        ^^^^^
;;!        xxxxx
(repeat_statement
  condition: (_) @condition
) @_.domain

;; Lists and maps
(table_constructor
  "{" @_.interior.start.endOf @value.iteration.start.endOf @collectionKey.iteration.start.endOf
  (field
    name: (_)
  )
  "}" @_.interior.end.startOf @value.iteration.end.startOf @collectionKey.iteration.end.startOf
) @map
;;!! a = { foo = "bar" }
;;!        ^^^--------
;;!        xxxxxx-----
;;!! a = { foo = "bar" }
;;!        ------^^^^^
;;!        ---xxxxxxxx
(field
  name: (_) @collectionKey @value.leading.endOf
  value: (_) @value @collectionKey.trailing.startOf
) @_.domain

;; In lua everything is a map, but a map that omits keys for entries
;; is similar enough to a list to warrant having that scope.
;;!! a = { "1", "2", "3" }
;;!      ^^^^^^^^^^^^^^^^^
(table_constructor
  "{" @_.interior.start.endOf
  (field
    !name
  )
  "}" @_.interior.end.startOf
) @list

;; Strings

(comment) @comment @textFragment
(string) @string
(string_content) @textFragment

;; Functions

;; callee:
;;!! local sum = add(5, 7)
;;!              ^^^------
;; call:
;;!! local sum = add(5, 7)
;;!              ^^^^^^^^^
(function_call
  name: (_) @functionCallee
) @_.domain @functionCall

;;!!local sum = add(5, 7)
;;!                 ^---
;;!                 xxx-
(
  (arguments
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!!local sum = add(5, 7)
;;!                 ****
(arguments
  "(" @argumentOrParameter.iteration.start.endOf
  ")" @argumentOrParameter.iteration.end.startOf
)

;;!!function add(5, 7)
;;!              ^---
;;!              xxx-
(
  (parameters
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!!function add(5, 7)
;;!              ****
(parameters
  "(" @argumentOrParameter.iteration.start.endOf
  ")" @argumentOrParameter.iteration.end.startOf
)

;; funk name:
;;!! function add(x, b) return x + y end
;;!  ---------^^^-----------------------
;; inside funk:
;;!! function add(x, b) return x + y end
;;!  -------------------^^^^^^^^^^^^----
;;! funk:
;;!! function add(x, b) return x + y end
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(function_declaration
  name: (_) @functionName
  body: (_)? @namedFunction.interior
) @functionName.domain @namedFunction

;; inside lambda:
;;!! __add = function(a, b) return a + b end
;;!          ---------------^^^^^^^^^^^^----
;; lambda:
;;!! __add = function(a, b) return a + b end
;;!          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(function_definition
  !name
  body: (_)? @_.interior
) @anonymousFunction

;; Names and values

;; Handle variable assignments
;;!! a = 42
;;!  ^-----
;;!  xxxx--
(
  (assignment_statement
    (variable_list) @name
    (_) @_.trailing.startOf
  ) @_dummy @_.domain
  (#not-parent-type? @_dummy variable_declaration)
)
;; Handle variable declarations
;;!! local a = 42
;;!  ------^-----
;;!  xxxxxxxxxx--
local_declaration: (variable_declaration
  (assignment_statement
    (variable_list) @name
    (_) @_.removal.end.startOf
  )
) @_.domain @_.removal.start.startOf

;; Handle assignment values
;;!! a = 42
;;!  ----^^
;;!  -xxxxx
(
  (assignment_statement
    (_) @_.leading.endOf
    (expression_list) @value
  ) @_dummy @_.domain
  (#not-parent-type? @_dummy variable_declaration)
)

;; Handle variable declaration values
;;!! local a = 42
;;!  ----------^^
;;!  -------xxxxx
local_declaration: (variable_declaration
  (assignment_statement
    (_) @_.leading.endOf
    (expression_list) @value
  )
) @_.domain

;;!! return a + b
;;!  -------^^^^^
;;!  ------xxxxxx
(return_statement
  (_) @value
) @_.domain

;; match a ternary condition
;;!! local max = x > y and x or y
;;!              ^^^^^
;;!              xxxxx
(binary_expression
  left: (binary_expression
    left: (binary_expression) @condition
    .
    "and"
  )
)

;; Structures and object access

;; (method_index_expression) @private.fieldAccess

(binary_expression
  [
    "<"
    "<<"
    "<="
    ">"
    ">="
    ">>"
  ] @disqualifyDelimiter
)
