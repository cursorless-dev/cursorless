;; We include javascript.jsx.scm because jsx scopes technically work in
;; javascript files even if they're not technically javascriptreact file type.

;; import javascript.jsx.scm
;; import javascript.core.scm

;; Define this here because the `field_definition` node type doesn't exist
;; in typescript.

;;!! class Foo { bar = function () {}; }
(
  (field_definition
    (function_expression
      !name
      (formal_parameters
        "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
        ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
      ) @argumentList
      (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
      (#child-range! @argumentList 1 -2)
    )
  ) @argumentList.domain.start @argumentOrParameter.iteration.domain.start
  .
  ";"? @argumentList.domain.end @argumentOrParameter.iteration.domain.end
)

;;!! class Foo { bar = function* () {}; }
(
  (field_definition
    (generator_function
      !name
      (formal_parameters
        "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
        ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
      ) @argumentList
      (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
      (#child-range! @argumentList 1 -2)
    )
  ) @argumentList.domain.start @argumentOrParameter.iteration.domain.start
  .
  ";"? @argumentList.domain.end @argumentOrParameter.iteration.domain.end
)

;;!! class Foo { bar = () => {}; }
(
  (field_definition
    (arrow_function
      (formal_parameters
        "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
        ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
      ) @argumentList
      (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
      (#child-range! @argumentList 1 -2)
    )
  ) @argumentList.domain.start @argumentOrParameter.iteration.domain.start
  .
  ";"? @argumentList.domain.end @argumentOrParameter.iteration.domain.end
)

(_
  ;;!! class Foo {
  ;;!!   bar = function() {};
  ;;!!   bar = function* () {};
  ;;!!   bar = () => {};
  ;;!! }
  (field_definition
    value: [
      (function_expression
        !name
      )
      (generator_function
        !name
      )
      (arrow_function)
    ]
  ) @statement.start @namedFunction.start @name.domain.start
  .
  ";"? @statement.end @namedFunction.end @name.domain.end
)

(_
  ;;!! foo = ...;
  ;;!  ^^^-------
  (field_definition
    property: (_) @name @value.leading.endOf
    value: (_)? @value @name.trailing.startOf
  ) @statement.start @_.domain.start
  .
  ";"? @statement.end @_.domain.end
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

;;!! function foo(...aaa) {}
;;!                  ^^^
(rest_pattern
  (identifier) @name
) @_.domain

;;!! catch(error) {}
;;!        ^^^^^
(catch_clause
  parameter: (_) @argumentOrParameter @name
)
