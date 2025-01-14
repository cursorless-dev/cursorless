;; We include javascript.jsx.scm because jsx scopes technically work in
;; javascript files even if they're not technically javascriptreact file type.

;; import javascript.jsx.scm
;; import javascript.core.scm

;; Define this here because the `field_definition` node type doesn't exist
;; in typescript.
(_
  ;;!! class Foo {
  ;;!!   foo = () => {};
  ;;!    ^^^^^^^^^^^^^^^
  ;;!!   foo = function() {};
  ;;!    ^^^^^^^^^^^^^^^^^^^^
  ;;!!   foo = function *() {};
  ;;!    ^^^^^^^^^^^^^^^^^^^^^^
  ;;!! }
  (field_definition
    property: (_) @functionName
    value: [
      (function_expression
        !name
      )
      (generator_function
        !name
      )
      (arrow_function)
    ]
  ) @namedFunction.start @functionName.domain.start
  .
  ";"? @namedFunction.end @functionName.domain.end
)

(_
  ;;!! foo = ...;
  ;;!  ^^^-------
  (field_definition
    property: (_) @name @value.leading.endOf
    value: (_)? @value @name.trailing.startOf
  ) @_.domain.start
  .
  ";"? @_.domain.end
)

;;!! foo(name) {}
;;!      ^^^^
(formal_parameters
  (identifier) @name
)

;;!! foo(value = 5) {}
;;!      ^^^^^   ^
(formal_parameters
  (assignment_pattern
    left: (_) @name @value.leading.endOf
    right: (_) @value
  ) @_.domain
)
