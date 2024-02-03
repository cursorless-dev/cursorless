;; map

;;!! x = { a = 1, b = 2 }
;;!      ^^^^^^^^^^^^^^^^
(record_expr) @map

;;!! f { a, b } = ...
;;!    ^^^^^^^^ 
(record_pattern) @map

;;!! type alias X = { x : Int, y : Bool }
;;!                 ^^^^^^^^^^^^^^^^^^^^^
(record_type) @map

;;!! x = { a = 1, b = 2 }
;;!        ^^^^^  ^^^^^
(field name: (_) @collectionKey expression: (_) @value) @_.domain

;;!! type alias X = { x : Int, y : Bool }
;;!                   ^^^^^^^  ^^^^^^^^
(field_type name: (_) @collectionKey typeExpression: (_) @value) @_.domain

;; string

;;!! x = "test"
;;!      ^^^^^^
(string_constant_expr) @string
;;!! x = 'a'
;;!      ^^^
(char_constant_expr) @string


;; list

;;!! x = [a, b, c]
;;!      ^^^^^^^^^
(list_expr) @list

;;!! case myList of
;;!!   [first, second] -> first
;;!    ^^^^^^^^^^^^^^^
(list_pattern) @list

;;!! x = (a, b)
;;!      ^^^^^^
(tuple_expr) @list

;;!! case myTuple of
;;!!   (first, second) -> first
;;!    ^^^^^^^^^^^^^^^
(tuple_pattern) @list

;;!! type alias Coord = (Int, Int)
;;!                     ^^^^^^^^^^
(tuple_type) @list

;;!! module Main exposing (f, g, h)
;;!                       ^^^^^^^^^
;;!! import Stuff exposing (f, g, h)
;;!                        ^^^^^^^^^
(exposing_list (exposed_value) @list)


;; anonymousFunction

;;!! x = \a -> f a
;;!      ^^^^^^^^^
(anonymous_function_expr param: (pattern)* @argumentOrParameter expr: (_) @anonymousFunction.interior) @anonymousFunction @_.domain

;; functionCall

;;!! x = f a b c
;;!      ^^^^^^^
(function_call_expr
  .
  (_) @functionCallee
  (_) @argumentOrParameter
) @functionCall @_.domain

;;!! x = 1 + 2
;;!      ^^^^^
(bin_op_expr 
  (_) @argumentOrParameter
  (operator) @functionCallee
  (_) @argumentOrParameter
) @functionCall @_.domain

;;!! type alias MyType = TypeWithParams a b
;;!                      ^^^^^^^^^^^^^^^^^^
(type_ref (_) @functionCallee part: (type_variable) @argumentOrParameter) @functionCall


;; namedFunction

;;!! f x y = x
;;!  ^^^^^^^^^
(value_declaration 
  functionDeclarationLeft: (function_declaration_left
    (lower_case_identifier) @functionName 
    pattern: (_)* @argumentOrParameter)
    body: (_) @namedFunction.interior
) @namedFunction @functionName.domain

;; branch

;;!! x = if a then b else c
;;!!     ^^^^^^^^^^^^^^^^^^
(if_else_expr 
  .
  (_)
  (_) @branch
  (_) @branch
) @ifStatement

;;!! case a of
;;!!   Nothing -> []
;;!    ^^^^^^^^^^^^^
;;!!   Just a  -> [a]
;;!    ^^^^^^^^^^^^^^
(case_of_branch) @branch

;; Types

;;!! type alias X = Int
;;!  ^^^^^^^^^^^^^^^^^^
(type_alias_declaration) @type
(type_declaration) @type
