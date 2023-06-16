;; We include javascript.jsx.scm because jsx scopes technically work in
;; javascript files even if they're not technically javascriptreact file type.

;; import javascript.jsx.scm
;; import javascript.core.scm

;; Define this here because the `field_definition` node type doesn't exist
;; in typescript.
(
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
      (function
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

(
  ;;!! foo = ...;
  ;;!  ^^^-------
  (field_definition
    property: (_) @name
  ) @name.domain.start
  .
  ";"? @name.domain.end
)
