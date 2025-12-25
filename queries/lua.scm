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

;; Capture assignment only if without variable prefix
;;!! count = count + 1
;;!  ^^^^^^^^^^^^^^^^^
(
  (assignment_statement) @statement
  (#not-parent-type? @statement variable_declaration)
)

;; Document iteration scopes

(
  (chunk) @statement.iteration @namedFunction.iteration
  (#document-range! @statement.iteration @namedFunction.iteration)
)
(
  (chunk) @name.iteration @value.iteration
  (#document-range! @name.iteration @value.iteration)
)

;; Block iteration scopes

(block) @statement.iteration @namedFunction.iteration
(block) @name.iteration @value.iteration

;; Conditionals

;;!! if true then end
;;!  ^^^^^^^^^^^^^^^^
;;!     ^^^^
(if_statement
  condition: (_) @condition
) @ifStatement @condition.domain @branch.iteration

;;!! if true then a=1 end
;;!              ^^^^^
(if_statement
  "then" @interior.start.endOf
  consequence: (_)
  .
  _ @interior.end.startOf
)

;;!! if true then end
;;!  ^^^^^^^^^^^^
(if_statement
  "if" @branch.start @branch.removal.start
  consequence: (_) @branch.end
  .
  "end" @branch.removal.end
)

;;!! if true then elseif false then
;;!  ^^^^^^^^^^^^
(if_statement
  "if" @branch.start @branch.removal.start.startOf
  consequence: (_) @branch.end
  .
  alternative: (elseif_statement) @branch.removal.end.startOf
  (#character-range! @branch.removal.end.startOf 4)
)

;;!! if true then else then
;;!  ^^^^^^^^^^^^
(if_statement
  "if" @branch.start @branch.removal.start.startOf
  consequence: (_) @branch.end
  .
  alternative: (else_statement) @branch.removal.end.startOf
)

;;!! elseif true then
;;!  ^^^^^^^^^^^^^^^^
;;!         ^^^^
(if_statement
  (elseif_statement
    condition: (_) @condition
    "then" @interior.start.endOf
  ) @branch @condition.domain
  .
  _ @interior.end.startOf
)

;;!! else then
;;!  ^^^^^^^^^

(if_statement
  (else_statement
    "else" @interior.start.endOf
  ) @branch
  .
  _ @interior.end.startOf
)

;;!! while true do
;;!        ^^^^
(while_statement
  condition: (_) @condition
  "do" @interior.start.endOf
  "end" @interior.end.startOf
) @condition.domain

;;!! repeat
;;!! ...
;;!! until i > 5
;;!        ^^^^^
;;!        xxxxx
(repeat_statement
  "repeat" @interior.start.endOf
  "until" @interior.end.startOf
  condition: (_) @condition
) @condition.domain

;;!! for i = 1, 3 do end
;;!      ^^^^^^^^
(for_statement
  (for_numeric_clause) @condition
) @condition.domain

;;!! for v in values do end
(for_statement
  (for_generic_clause
    (variable_list) @name
    (expression_list) @value
  )
) @_.domain

(for_statement
  "do" @interior.start.endOf
  "end" @interior.end.startOf
)

;; Lists and maps
(table_constructor
  (field
    name: (_)
  )
) @map

(table_constructor
  "{" @value.iteration.start.endOf @collectionKey.iteration.start.endOf
  (field
    name: (_)
  )
  "}" @value.iteration.end.startOf @collectionKey.iteration.end.startOf
)

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
  (field
    !name
  )
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

;;!! local sum = add(5, 7)
;;!                  ^---
;;!                  xxx-
(
  (arguments
    (_)? @argumentOrParameter.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @argumentOrParameter.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! local sum = add(5, 7)
;;!                  ****
(function_call
  (arguments
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! function add(5, 7)
;;!               ^---
;;!               xxx-
(
  (parameters
    (_)? @argumentOrParameter.leading.endOf
    .
    (_) @argumentOrParameter @name
    .
    (_)? @argumentOrParameter.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! function add(5, 7)
;;!               ****
(_
  (parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf @name.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf @name.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

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
  name: (_) @name
  parameters: (_) @interior.start.endOf
  "end" @interior.end.startOf
) @namedFunction @name.domain

;; inside lambda:
;;!! __add = function(a, b) return a + b end
;;!          ---------------^^^^^^^^^^^^----
;; lambda:
;;!! __add = function(a, b) return a + b end
;;!          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(function_definition
  parameters: (_) @interior.start.endOf
  "end" @interior.end.startOf
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

;;!! local a, b, c
(
  (variable_list
    (_)? @collectionItem.leading.endOf
    .
    (_) @collectionItem
    .
    (_)? @collectionItem.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @collectionItem @_dummy ", " ",\n")
)

;;!! = 1, 2, 3
(
  (expression_list
    (_)? @collectionItem.leading.endOf
    .
    (_) @collectionItem
    .
    (_)? @collectionItem.trailing.startOf
  ) @_dummy
  (#single-or-multi-line-delimiter! @collectionItem @_dummy ", " ",\n")
)

[
  (variable_list)
  (expression_list)
] @collectionItem.iteration

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
