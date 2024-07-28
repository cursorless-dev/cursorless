;; https://github.com/tree-sitter/tree-sitter-php/blob/master/php/src/grammar.json

;; @statement generated by the following command:
;;  curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-php/master/src/node-types.json | jq '[.[] | select(.type == "_statement" or .type == "_simple_statement") | .subtypes[].type]' | grep -v '\"_' | sed -n '1d;p' | sed '$d' | sort
;; and then cleaned up.
[
  (break_statement)
  (class_declaration)
  (compound_statement)
  (const_declaration)
  (continue_statement)
  (declare_statement)
  (do_statement)
  (echo_statement)
  (empty_statement)
  (enum_declaration)
  (expression_statement)
  (for_statement)
  (foreach_statement)
  (function_definition)
  (function_static_declaration)
  (global_declaration)
  (goto_statement)
  (if_statement)
  (interface_declaration)
  (named_label_statement)
  (namespace_definition)
  (namespace_use_declaration)
  (return_statement)
  (switch_statement)
  (trait_declaration)
  (try_statement)
  (unset_statement)
  (while_statement)
] @statement

[
  (shell_command_expression)
  (string)
  (encapsed_string)
] @string

(string
  .
  "'" @textFragment.start.endOf
  "'" @textFragment.end.startOf
  .
)

(encapsed_string
  .
  "\"" @textFragment.start.endOf
  "\"" @textFragment.end.startOf
  .
)

(shell_command_expression
  .
  "`" @textFragment.start.endOf
  "`" @textFragment.end.startOf
  .
)

(comment) @comment @textFragment

(if_statement) @ifStatement

[
  (array_creation_expression)
] @list

(class_declaration
  name: (_) @className
) @class @className.domain

[
  (function_definition) @namedFunction
  (method_declaration) @namedFunction
  (expression_statement
    (assignment_expression
      right: (anonymous_function_creation_expression)
    ) @namedFunction
    ";" @_.trailing
  )
  (expression_statement
    (assignment_expression
      right: (arrow_function)
    ) @namedFunction
    ";" @_.trailing
  )
] @namedFunction.domain

[
  (anonymous_function_creation_expression)
  (arrow_function)
] @anonymousFunction

[
  (function_definition
    name: (_) @functionName
  )
  (method_declaration
    name: (_) @functionName
  )
] @functionName.domain

[
  (function_call_expression)
  (object_creation_expression)
] @functionCall

;;!! $value = 2;
;;!  ^^^^^^
;;!           ^
(assignment_expression
  left: (_) @name @value.leading.endOf
  right: (_) @value
) @_.domain

;;!! $value += 2;
;;!  ^^^^^^
;;!            ^
(augmented_assignment_expression
  left: (_) @name @value.leading.endOf
  right: (_) @value
) @_.domain

(class_declaration
  name: (_) @name
) @_.domain
(function_definition
  name: (_) @name
) @_.domain
(method_declaration
  name: (_) @name
) @_.domain

;;!! ['num' => 1];
;;!   ^^^^^
;;!            ^
(array_element_initializer
  (_) @collectionKey @value.leading.endOf
  (_) @value @collectionKey.trailing.startOf
) @_.domain

;;!! return 2;
;;!         ^
(return_statement
  "return" @_.leading.endOf
  (_) @value
) @_.domain

;;!! yield 2;
;;!        ^
(yield_expression
  "yield" @_.leading.endOf
  (_) @value
) @_.domain

;;!! (string $str)
;;!   ^^^^^^
;;!          ^^^^
(simple_parameter
  type: (_) @type
  name: (_) @name
) @_.domain

;;!! (array ...$nums)
;;!   ^^^^^
;;!            ^^^^^
(variadic_parameter
  type: (_) @type
  name: (_) @name
) @_.domain

;;!! catch (Exception $e) {}
;;!         ^^^^^^^^^
(catch_clause
  type: (_) @type
  name: (_) @name
) @_.domain

(formal_parameters
  "(" @type.iteration.start.endOf @name.iteration.start.endOf @value.iteration.start.endOf
  ")" @type.iteration.end.startOf @name.iteration.end.startOf @value.iteration.end.startOf
) @_.domain

;;!! (string) $str;
;;!   ^^^^^^
(cast_expression
  type: (_) @type
  value: (_) @_.removal.end.startOf
) @_.removal.start.startOf @_.domain

;;!! public string $value;
;;!         ^^^^^^
;;!                ^^^^^^
(property_declaration
  type: (_) @type
  (property_element
    (variable_name) @name
  )
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
(array_element_initializer
  "=>" @disqualifyDelimiter
)
(heredoc
  "<<<" @disqualifyDelimiter
)
(nowdoc
  "<<<" @disqualifyDelimiter
)
(member_access_expression
  "->" @disqualifyDelimiter
)
(nullsafe_member_access_expression
  "?->" @disqualifyDelimiter
)
(member_call_expression
  "->" @disqualifyDelimiter
)
(nullsafe_member_call_expression
  "?->" @disqualifyDelimiter
)
