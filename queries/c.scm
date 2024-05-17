;; Generated by the following command:
;;  >  curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-cpp/master/src/node-types.json | jq '[.[] | select(.type == "compound_statement") | .children.types[].type] + [.[] | select(.type == "_statement") | .subtypes[].type]'
[
  (alias_declaration)
  (declaration)
  (function_definition)
  (linkage_specification)
  (namespace_definition)
  (preproc_call)
  (preproc_def)
  (preproc_function_def)
  (preproc_if)
  (preproc_ifdef)
  (preproc_include)
  (static_assert_declaration)
  (template_declaration)
  (template_instantiation)
  (type_definition)
  (using_declaration)
  (break_statement)
  (case_statement)
  (compound_statement)
  (continue_statement)
  (do_statement)
  (expression_statement)
  (for_range_loop)
  (for_statement)
  (goto_statement)
  (if_statement)
  (labeled_statement)
  (return_statement)
  (switch_statement)
  (throw_statement)
  (try_statement)
  (while_statement)
] @statement

(if_statement) @ifStatement

(
  (string_literal) @string @textFragment
  (#child-range! @textFragment 0 -1 true true)
)
(comment) @comment @textFragment

(_
  (struct_specifier
    name: (_) @className
  ) @_.domain.start
  ";"? @_.domain.end
)
(_
  (enum_specifier
    name: (_) @className
  ) @_.domain.start
  ";"? @_.domain.end
)
(_
  (union_specifier
    name: (_) @className
  ) @_.domain.start
  ";"? @_.domain.end
)

(function_definition) @namedFunction

;; void funcName();
(declaration
  (function_declarator
    declarator: (_) @functionName
  )
) @namedFunction @functionName.domain

;; void C::funcName() {}
(function_definition
  declarator: (_
    declarator: (_
      name: (_) @functionName
    )
  )
) @_.domain

;; void funcName() {}
(function_definition
  declarator: (_
    declarator: (_
      !name
    ) @functionName
  )
) @_.domain

;;  void ClassName::method() {}
(function_definition
  declarator: (_
    declarator: (_
      namespace: (_) @className
    )
  )
) @_.domain

(lambda_expression) @anonymousFunction
(initializer_list) @list
(attribute) @attribute

(call_expression) @functionCall
(declaration
  (init_declarator) @functionCall
) @_.domain

(call_expression
  function: (_) @functionCallee
) @_.domain
(declaration
  (init_declarator
    declarator: (_) @functionCallee
  )
) @_.domain

(switch_statement
  condition: (_
    value: (_) @private.switchStatementSubject
  )
) @_.domain

(_
  declarator: (_
    declarator: (_
      name: (_) @name
    )
  )
) @_.domain

(_
  declarator: (_
    name: (_) @name
  )
) @_.domain

(_
  declarator: (_
    declarator: (_
      !name
    ) @name
  )
) @_.domain

(parameter_list
  (_
    declarator: (_) @name
  )
) @_.domain

(assignment_expression
  left: (_) @name
) @_.domain

(_
  name: (_) @name
) @_.domain
