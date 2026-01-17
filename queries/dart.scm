;;!! if () {}
;;!  ^^^^^^^^
(
  (if_statement) @ifStatement @statement
  (#not-parent-type? @ifStatement if_statement)
)

;;!! [ 0 ]
;;!  ^^^^^
[
  (list_literal)
  (list_pattern)
] @list

;;!! { value: 0 }
;;!  ^^^^^^^^^^^^
[
  (set_or_map_literal)
  (map_pattern)
] @map

;;!! class Foo {}
;;!  ^^^^^^^^^^^^
(class_definition
  name: (_) @name
) @class @name.domain
