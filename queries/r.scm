;; https://github.com/r-lib/tree-sitter-r/blob/main/src/grammar.json
;; https://github.com/r-lib/tree-sitter-r/blob/main/src/node-types.json

[
  (for_statement)
  (if_statement)
  (repeat_statement)
  (function_definition)
] @statement

(comment) @comment
(if_statement) @ifStatement
(argument) @argumentOrParameter
(call) @functionCall
(identifier) @identifier

;; ;; https://github.com/r-lib/tree-sitter-r/blob/main/queries/highlights.scm
;; ;; Plus magrittr operators
;; [ "?" ":=" "=" "<-" "<<-" "->" "->>"
;;   "~" "|>" "||" "|" "&&" "&"
;;   "<" "<=" ">" ">=" "==" "!="
;;   "+" "-" "*" "/" "::" ":::"
;;   "**" "^" "$" "@" ":" "%in%"
;;   "%>%" "%<>%" "%T>%" "%$%"
;;   "special"
;; ] @operator
