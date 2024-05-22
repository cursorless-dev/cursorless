(if_statement) @ifStatement

(class_declaration
  name: (identifier) @className
) @class @_.domain
(compilation_unit) @class.iteration @className.iteration
;; Treat interior of all bodies as iteration scopes for class and classname, eg
;;!! private static void foo() {   }
;;!                             ***
(_
  body: (_
    .
    "{" @class.iteration.start.endOf @className.iteration.start.endOf
    "}" @class.iteration.end.startOf @className.iteration.end.startOf
    .
  )
)

(
  (string_literal) @string @textFragment
  (#child-range! @textFragment 0 -1 true true)
)
(comment) @comment @textFragment
