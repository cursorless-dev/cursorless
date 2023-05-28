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
