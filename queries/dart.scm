;;!! if () {}
;;!  ^^^^^^^^
(if_statement) @ifStatement

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
  name: (_) @className
) @class @className.domain
