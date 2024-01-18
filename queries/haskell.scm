;; import haskell.namedFunction.scm

;; argumentOrParameter
(patterns
  (_) @argumentOrParameter
)

;; branch

;; functions
(function
  rhs: (_) @value
) @branch

;; guards
(guard_equation
  [
    ;; ... with a SINGLE guard
    (guards
      .
      (guard) @branch.start @condition @condition.domain.start
      .
    )
    ;; ... with MULTIPLE guards
    (guards
      .
      (guard) @branch.start @condition.start @condition.domain.start
      (guard) @branch.start @condition.end @condition.domain.start
      .
    )
  ]
  .
  (_) @branch.end @condition.domain.end @value
) @branch.removal

;; case expressions
(exp_case
  (_) @condition
  .
  (alts
    (alt
      .
      (_) @argumentOrParameter
      (_) @value
      .
    ) @branch
  )
  .
)


;; "arg" function parameter or function call argument
;; (
;;   (
;;     (signature
;;       (variable)
;;     )?
;;     .
;;     (function
;;       .
;;       (variable) @functionName
;;       .
;;       (patterns
;;         (_) @argumentOrParameter
;;       )?
;;       .
;;       [
;;         (
;;           (_) @namedFunction.interior
;;         )
;;         (
;;           (_) @namedFunction.interior
;;           .
;;           (where)
;;         )
;;       ]
;;       .
;;     )+
;;   ) @namedFunction @functionName.domain @argumentOrParameter.iteration
;; )

;; anonymousFunction
;; "lambda" anonymous lambda function
;; (exp_lambda
;;   (_) @anonymousFunction.interior .
;; ) @anonymousFunction
;; (exp_lambda_case
;;   (alts
;;     (alt
;;       (_) @anonymousFunction.interior .
;;     )
;;   )
;; ) @anonymousFunction

;; branch
;; "branch" branch of a switch or if statement
;; function declaration with multiple patterns
;; TODO: capture the lhs? capture the rhs?
;; (haskell
;;   ; TODO: only if no guard equations?
;;   (function) @branch
;; )
;; ; guards
;; (haskell
;;   (function
;;     (guard_equation) @branch
;;   )
;; )
;; ; alternatives
;; (exp_lambda_case
;;   (alts
;;     (alt) @branch
;;   )
;; )

;; ; functionCall
;; ; "call" function call, eg foo(1, 2)

;; ; functionCallee
;; ; "callee" the function being called in a function call

;; ; className
;; ; "class name" the name in a class declaration
;; ; (haskell
;; ;   (class
;; ;     (class_head
;; ;       class: (class_name
;; ;         (type) @className
;; ;       )
;; ;     )
;; ;   )
;; ; )
;; ; instance name
;; ; (haskell
;; ;   (instance
;; ;     (instance_head
;; ;       (class_name
;; ;         (type) @name
;; ;       )
;; ;     )
;; ;   )
;; ; )

;; ; class
;; ; "class" class definition

;; ; comment
;; ; "comment" comment

;; ; condition
;; ; "condition" condition, eg in an if statement, while loop etc

;; ; functionName
;; ; "funk name" the name in a function declaration
;; ; function name
;; ; (haskell
;; ;   (function
;; ;     name: (_) @functionName
;; ;   )
;; ; )
;; ; foreign import name
;; ; (haskell
;; ;   (foreign_import
;; ;     (signature
;; ;       (_) @name
;; ;     )
;; ;   )
;; ; )
;; ; foreign export name
;; ; (haskell
;; ;   (foreign_export
;; ;     (signature
;; ;       (_) @name
;; ;     )
;; ;   )
;; ; )

;; ; namedFunction
;; ; "funk" name function declaration
;; (function
;;   rhs: (_) @namedFunction.interior
;; ) @namedFunction

;; ; ifStatement
;; ; "if state" if statement

;; ; list
;; ; "list" list / array
;; (exp_arithmetic_sequence) @list
;; (exp_list) @list
;; (exp_list_comprehension) @list
;; ; TODO: include tuple?
;; ; (type_tuple) @list
;; ; (type_unboxed_tuple) @list
;; ; TODO: include list patterns?
;; ; (pat_list) @list
;; ; TODO: include tuple patterns?
;; ; (pat_tuple) @list
;; ; (pat_unboxed_tuple) @list

;; ; map
;; ; "map" map / object
;; (exp_record) @map

;; ; collectionItem
;; ; "item" an entry in a map / object / list
;; ; record item
;; ; (exp_field
;; ;   field: (_)
;; ;   (_) @collectionItem
;; ; )

;; ; collectionKey
;; ; "key" key in a map / object
;; ; record key
;; ; (exp_field
;; ;   field: (_) @collectionKey
;; ;   ; TODO: handle subfields
;; ; )
;; ; (exp_projection_selector
;; ;   (_) @collectionKey
;; ;   ; TODO: handle subfields
;; ; )

;; ; name
;; ; "name" the name in a declaration (eg function name)
;; ; function name
;; ; (haskell
;; ;   (function
;; ;     name: (_) @name
;; ;   )
;; ; )
;; ; foreign function import
;; ; (haskell
;; ;   (foreign_import
;; ;     (signature
;; ;       (_) @name
;; ;     )
;; ;   )
;; ; )
;; ; foreign function export
;; ; (haskell
;; ;   (foreign_export
;; ;     (signature
;; ;       (_) @name
;; ;     )
;; ;   )
;; ; )
;; ; data type name
;; ; (haskell
;; ;   (adt
;; ;     (type) @name
;; ;   )
;; ; )
;; ; new type name
;; ; (haskell
;; ;   (newtype
;; ;     (type) @name
;; ;   )
;; ; )
;; ; type alias name
;; ; (haskell
;; ;   (type_alias
;; ;     (type) @name
;; ;   )
;; ; )
;; ; type family name
;; ; (haskell
;; ;   (type_family
;; ;     (head
;; ;       (type) @name
;; ;     )
;; ;   )
;; ; )
;; ; class name
;; ; (haskell
;; ;   (class
;; ;     (class_head
;; ;       class: (class_name
;; ;         (type) @name
;; ;       )
;; ;     )
;; ;   )
;; ; )
;; ; instance name
;; ; (haskell
;; ;   (instance
;; ;     (instance_head
;; ;       (class_name
;; ;         (type) @name
;; ;       )
;; ;     )
;; ;   )
;; ; )

;; ; statement
;; ; "state" a statement, eg let foo
;; (stmt) @statement
;; ; TODO: let clause?
;; ; TODO: where clause?

;; ; string
;; ; "string" string
;; (string) @string

;; ; type
;; ; "type" a type annotation or declaration
;; ;; declaration: type alias
;; (haskell
;;   (type_alias
;;     (type_variable) @argumentOrParameter
;;     (_) @type.interior .
;;   ) @type
;; )
;; ;; declaration: data type
;; (haskell
;;   (adt
;;     (type_variable) @argumentOrParameter
;;     (_) @type.interior .
;;   ) @type
;; )

;; ; value
;; ; "value" a value eg in a map / object, return statement, etc
