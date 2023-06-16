;; Note that we don't just import `javascript.scm` because that includes
;; `javascript.jsx.scm`, and tree-sitter would complain because those node
;; types are not defined in the typescript grammar.

;; import javascript.core.scm

(optional_parameter
    (identifier) @name
) @_.domain

(required_parameter
    (identifier) @name
) @_.domain

;; Define these here because these node types don't exist in javascript.
(
  [
    ;; foo(): void;
    ;; (in interface)
    ;; foo() {}
    ;; (in class)
    (method_signature
      name: (_) @functionName @name
    )

    ;; abstract foo(): void;
    (abstract_method_signature
      name: (_) @functionName @name
    )

    ;; [public | private | protected] foo = () => {};
    ;; [public | private | protected] foo = function() {};
    ;; [public | private | protected] foo = function *() {};
    (public_field_definition
      name: (_) @functionName
      value: [
        (function
          !name
        )
        (generator_function
          !name
        )
        (arrow_function)
      ]
    )
  ] @namedFunction.start @functionName.domain.start @name.domain.start
  .
  ";"? @namedFunction.end @functionName.domain.end @name.domain.end
)

(
  ;; [public | private | protected] foo = ...;
  (public_field_definition
    name: (_) @name
  ) @name.domain.start
  .
  ";"? @name.domain.end
)
