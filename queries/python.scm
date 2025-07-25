;; import python.fieldAccess.scm

;; https://github.com/tree-sitter/tree-sitter-python/blob/master/src/grammar.json

;; Generated by the following command:
;; > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-python/d6210ceab11e8d812d4ab59c07c81458ec6e5184/src/node-types.json \
;;   | jq '[.[] | select(.type == "_simple_statement" or .type == "_compound_statement") | .subtypes[].type]'
[
  (assert_statement)
  (break_statement)
  (continue_statement)
  (decorated_definition)
  (delete_statement)
  (exec_statement)
  (expression_statement)
  (for_statement)
  (future_import_statement)
  (global_statement)
  (import_from_statement)
  (import_statement)
  (match_statement)
  (nonlocal_statement)
  (print_statement)
  (raise_statement)
  (return_statement)
  (try_statement)
  (while_statement)
  (with_statement)
  ;; Disabled on purpose. We don't think this is a statement.
  ;; (pass_statement)
  ;; Disabled on purpose. We have a better definition for these below.
  ;; (class_definition)
  ;; (function_definition)
  ;; (if_statement)
] @statement

;;!! a = 25
;;!      ^^
;;!   xxxxx
;;!  ------
(assignment
  (_) @_.leading.endOf
  .
  right: (_) @value
) @_.domain

;; value:
;;!! a /= 25
;;!       ^^
;;!   xxxxxx
;;!  -------
;; name:
;;!! a /= 25
;;!  ^
;;!  xxxxx
;;!  -------
(augmented_assignment
  left: (_) @name @value.leading.endOf
  right: (_) @value @name.trailing.startOf
) @_.domain

;;!! a = 25
;;!  ^
;;!  xxxx
;;!  ------
;;!! a: int = 25
;;!  ^
;;!  xxxxxxxxx
;;!  -----------
(assignment
  left: (_) @name
  right: (_)? @_.trailing.startOf
) @_.domain

(_
  name: (_) @name
  (#not-parent-type? @name function_definition class_definition)
) @_.domain

;;!! def aaa(bbb):
;;!          ^^^
(parameters
  (identifier) @name
)

;;!! def aaa(bbb: str):
;;!          ^^^
;;!          --------
(typed_parameter
  .
  (_) @name
) @_.domain

;; Matches any node at field `type` of its parent, with leading delimiter until
;; previous named node. For example:
;;!! aaa: str = "bbb";
;;!       ^^^
;;!  -----------------
;;!     xxxxx
(_
  (_) @_.leading.endOf
  .
  type: (_) @type
) @_.domain

;;!! map[int, str]
;;!      ^^^  ^^^
(generic_type
  (type_parameter
    (type)? @_.leading.endOf
    .
    (type) @type
    .
    (type)? @_.trailing.startOf
  )
  (#insertion-delimiter! @type ", ")
)

;;!! map[int, str]
;;!      ^^^^^^^^
;;!  -------------
(generic_type
  (type_parameter
    "[" @type.iteration.start.endOf
    "]" @type.iteration.end.startOf
  )
)

;;!! d = {"a": 1234}
;;!            ^^^^
;;!          xxxxxx
;;!       ---------
;;!! {value: key for (key, value) in d1.items()}
;;!          ^^^
;;!        xxxxx
;;!   ----------
;;!! def func(value: str = ""):
;;!                        ^^
;;!                     xxxxx
;;!           ---------------
(
  (_
    (_) @_.leading.endOf
    .
    value: (_) @value
  ) @_.domain
  (#not-type? @_.domain subscript)
)

;;!! return 1
;;!         ^
;;!        xx
;;!  --------
;;
;; NOTE: in tree-sitter, both "return" and the "1" are children of `return_statement`
;; but "return" is anonymous whereas "1" is named node, so no need to exclude explicitly
(return_statement
  (_) @value
) @_.domain

;;!! yield 1
;;!        ^
;;!       xx
;;!  -------
;;
;; NOTE: in tree-sitter, both "yield" and the "1" are children of `yield` but
;; "yield" is anonymous whereas "1" is named node, so no need to exclude
;; explicitly
(yield
  (_) @value
) @_.domain

;;!! with aaa:
;;!       ^^^
(with_statement
  body: (_) @interior
) @interior.domain

;;!! with aaa:
;;!       ^^^
;;!  --------
(
  (with_statement
    (with_clause
      (with_item)? @_.leading.endOf
      .
      (with_item
        value: (_) @value @name
      )
      .
      (with_item)? @_.trailing.startOf
    )
  ) @_.domain
  (#not-type? @value "as_pattern")
  (#allow-multiple! @value @name)
)

;;!! with aaa:
;;!       ^^^
;;!  --------
(
  (with_statement
    (with_clause
      (with_item)? @_.leading.endOf
      .
      (with_item
        value: (_) @value @name
      )
      .
      (with_item)? @_.trailing.startOf
    ) @_with_clause
  )
  (#not-type? @value "as_pattern")
  (#has-multiple-children-of-type? @_with_clause "with_item")
  (#allow-multiple! @value @name)
)

;;!! with aaa as bbb:
;;!       ^^^        <~~ value
;;!              ^^^ <~~ name
;;!  ----------------
(
  (with_statement
    (with_clause
      (with_item
        value: (as_pattern
          (_) @value @name.leading.endOf
          alias: (_) @name @value.trailing.startOf
        )
      )
    )
  ) @_.domain
  (#allow-multiple! @value @name)
)

;;!! with aaa as ccc, bbb:
;;!       ^^^         ^^^
;;!       ----------  ---
(
  (with_statement
    (with_clause
      (with_item
        value: (as_pattern
          (_) @value @name.leading.endOf
          alias: (_) @name @value.trailing.startOf
        )
      ) @_.domain
    ) @_with_clause
  )
  (#has-multiple-children-of-type? @_with_clause "with_item")
  (#allow-multiple! @value @name)
)

(with_statement
  (with_clause) @name.iteration @value.iteration
) @name.iteration.domain @value.iteration.domain

;;!! lambda str: len(str) > 0
;;!              ^^^^^^^^^^^^
;;!  ------------------------
(lambda
  body: (_) @value
) @_.domain

;; value:
;;!! for aaa in bbb:
;;!             ^^^
;;!  ---------------
;; name:
;;!! for aaa in bbb:
;;!      ^^^
;;!  ---------------
(for_statement
  left: (_) @name
  right: (_) @value
) @_.domain

(comment) @comment @textFragment

(string
  (string_start) @textFragment.start.endOf
  (string_end) @textFragment.end.startOf
) @string

[
  (dictionary)
  (dictionary_comprehension)
] @map

[
  (list)
  (list_comprehension)
  (set)
] @list

;;!! def foo(): pass
;;!  ^^^^^^^^^^^^^^^
(
  (function_definition
    name: (_) @name
    body: (_) @interior
  ) @namedFunction @statement @_.domain
  (#not-parent-type? @namedFunction decorated_definition)
)

;;!! @value def foo(): pass
;;!  ^^^^^^^^^^^^^^^^^^^^^^
(decorated_definition
  (function_definition
    name: (_) @name
    body: (_) @interior
  )
) @namedFunction @_.domain

;;!!  def aaa() -> str:
;;!                ^^^
;;!            xxxxxxx
;;!  [-----------------
;;!!      pass
;;!   --------]
(function_definition
  (_) @_.leading.endOf
  .
  return_type: (_) @type
) @_.domain

;;!! class MyClass:
(
  (class_definition) @class @type @statement
  (#not-parent-type? @class decorated_definition)
)

(
  (class_definition
    name: (_) @name
    body: (_) @interior
  ) @_.domain
  (#not-parent-type? @_.domain decorated_definition)
)

;;!! @value
;;!! class MyClass:
(decorated_definition
  (class_definition)
) @class @type @statement

(decorated_definition
  (class_definition
    name: (_) @name
    body: (_) @interior
  )
) @_.domain

(
  (module) @statement.iteration @class.iteration @namedFunction.iteration
  (#document-range! @statement.iteration @class.iteration @namedFunction.iteration)
)

;; This is a hack to handle the case where the entire document is a `with` statement
(
  (module
    (_) @_statement
  ) @name.iteration @value.iteration @type.iteration
  (#not-type? @_statement "with_statement")
  (#document-range! @name.iteration @value.iteration @type.iteration)
)

(class_definition
  body: (_) @namedFunction.iteration @name.iteration
)

;;!! def foo():
;;!!     a = 0
;;!     <*****
;;!!     b = 1
;;!      *****
;;!!     c = 2
;;!      *****>
(block) @name.iteration @value.iteration @type.iteration
(block) @statement.iteration

;;!! {"a": 1, "b": 2, "c": 3}
;;!   **********************
(dictionary
  "{" @collectionKey.iteration.start.endOf @value.iteration.start.endOf
  "}" @collectionKey.iteration.end.startOf @value.iteration.end.startOf
)

;;!! def func(a=0, b=1):
;;!           ********
(parameters
  "(" @value.iteration.start.endOf @name.iteration.start.endOf @type.iteration.start.endOf
  ")" @value.iteration.end.startOf @name.iteration.end.startOf @type.iteration.end.startOf
)

;;!! foo()
;;!  ^^^^^
(call) @functionCall

;;!! foo()
;;!  ^^^^^
(call
  function: (_) @functionCallee
) @_.domain

;;!! match value:
;;!        ^^^^^
(match_statement
  subject: (_) @value
  body: (_) @interior
) @_.domain

;;!! { "value": 0 }
;;!    ^^^^^^^
;;!    xxxxxxxxx
(pair
  key: (_) @collectionKey
  value: (_) @_.trailing.startOf
) @_.domain

;;!! if True:
;;!     ^^^^
;;!! elif True:
;;!       ^^^^
;;!! while True:
;;!        ^^^^
(_
  condition: (_) @condition
) @_.domain

;;!! case value:
;;!        ^^^^^
(case_clause
  (case_pattern) @condition.start
  guard: (_)? @condition.end
  consequence: (_) @interior
) @_.domain

;;!! case 0: pass
;;!  ^^^^^^^^^^^^
(case_clause) @branch

(match_statement
  body: (_) @branch.iteration @condition.iteration
) @branch.iteration.domain @condition.iteration.domain

;;!! 1 if True else 0
;;!       ^^^^
;;!  ----------------
(
  (conditional_expression
    "if" @interior.domain.start
    .
    (_) @condition @interior @interior.domain.end
  ) @condition.domain
)

;;!! 1 if True else 0
;;!  ^
(
  (conditional_expression
    (_) @branch @interior
    .
    "if"
  )
)

;;!! 1 if True else 0
;;!                 ^
(
  (conditional_expression
    "else" @interior.domain.start
    .
    (_) @branch @interior @interior.domain.end
  )
)

(conditional_expression) @branch.iteration

;;!! [aaa for aaa in bbb if ccc]
;;!! (aaa for aaa in bbb if ccc)
;;!! {aaa for aaa in bbb if ccc}
;;!                         ^^^
;;!                      xxxxxx
;;!  ---------------------------
;;!! {aaa: aaa for aaa in bbb if ccc}
;;!                              ^^^
;;!                           xxxxxx
;;!  --------------------------------
(_
  (if_clause
    "if"
    (_) @condition
  ) @_.removal
  (#not-parent-type? @_.removal case_clause)
) @_.domain

;;!! if true: pass else: pass
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^
(if_statement) @ifStatement @statement @branch.iteration

;;!! if True: pass
;;!  ^^^^^^^^^^^^^
(if_statement
  "if" @interior.domain.start
  consequence: (_) @interior @interior.domain.end
)

;;!! if True: pass
;;!  ^^^^^^^^^^^^^
(if_statement
  "if" @branch.start @branch.removal.start
  consequence: (_) @branch.end @branch.removal.end
  alternative: (else_clause)? @branch.removal.end.startOf
)

;;!! if True: pass elif False: pass
;;!  ^^^^^^^^^^^^^
(if_statement
  "if" @branch.start @branch.removal.start
  consequence: (_) @branch.end @branch.removal.end
  alternative: (elif_clause
    "elif" @branch.removal.end.startOf
    (#character-range! @branch.removal.end.startOf 2)
  )
)

;;!! elif True: pass
;;!  ^^^^^^^^^^^^^^^
(elif_clause
  consequence: (_) @interior
) @branch @interior.domain

;;!! else: pass
;;!  ^^^^^^^^^^
(else_clause
  body: (_) @interior
) @branch @interior.domain

;;!! try: pass
;;!  ^^^^^^^^^
(try_statement
  "try" @branch.start @interior.domain.start
  body: (_) @branch.end @interior @interior.domain.end
)

;;!! except: pass
;;!  ^^^^^^^^^^^^
(except_clause
  (block) @interior
) @branch @interior.domain

;;!! except*: pass
;;!  ^^^^^^^^^^^^^
(except_group_clause
  (block) @interior
) @branch @interior.domain

;;!! except Exception as ex:
;;!         ^^^^^^^^^^^^^^^
;;!         ^^^^^^^^^
;;!                      ^^
(except_clause
  (as_pattern
    (_) @type
    alias: (_) @name
  ) @argumentOrParameter @_.domain
)

;;!! finally: pass
;;!  ^^^^^^^^^^^^^
(finally_clause
  (block) @interior
) @branch @interior.domain

(try_statement) @branch.iteration

;;!! while True: pass
;;!  ^^^^^^^^^^^^^^^^
(while_statement
  "while" @branch.start
  body: (_) @branch.end @interior
) @interior.domain

(while_statement) @branch.iteration

;;!! for aaa in bbb: pass
;;!  ^^^^^^^^^^^^^^^^^^^^
(for_statement
  "for" @branch.start
  body: (_) @branch.end @interior
) @interior.domain

(for_statement) @branch.iteration

;;!! import foo, bar
;;!         ^^^  ^^^
(
  (import_statement
    name: (_)? @_.leading.endOf
    .
    name: (_) @collectionItem
    .
    name: (_)? @_.trailing.startOf
  )
  (#insertion-delimiter! @collectionItem ", ")
)

;;!! from foo import bar, baz
;;!                  ^^^  ^^^
(
  (import_from_statement
    [
      name: (_)? @_.leading.endOf
      "import" @_.leading.endOf
    ]
    .
    name: (_) @collectionItem
    .
    name: (_)? @_.trailing.startOf
  )
  (#insertion-delimiter! @collectionItem ", ")
)

;;!! global foo, bar
;;!         ^^^  ^^^
(
  (global_statement
    (identifier)? @_.leading.endOf
    .
    (identifier) @collectionItem
    .
    (identifier)? @_.trailing.startOf
  )
  (#insertion-delimiter! @collectionItem ", ")
)

;;!! for key, value in map.items():
;;!      ^^^  ^^^^^
(
  (pattern_list
    (identifier)? @_.leading.endOf
    .
    (identifier) @collectionItem
    .
    (identifier)? @_.trailing.startOf
  )
  (#insertion-delimiter! @collectionItem ", ")
)

(import_statement
  .
  (_) @collectionItem.iteration.start.startOf
) @collectionItem.iteration.end.endOf @collectionItem.iteration.domain

(import_from_statement
  "import"
  .
  (_) @collectionItem.iteration.start.startOf
) @collectionItem.iteration.end.endOf @collectionItem.iteration.domain

(global_statement
  .
  (_) @collectionItem.iteration.start.startOf
) @collectionItem.iteration.end.endOf @collectionItem.iteration.domain

(pattern_list) @collectionItem.iteration

;;!! def foo(aaa, bbb) {}
;;!          ^^^  ^^^
(_
  parameters: (_
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    ","? @_.trailing.start.endOf
    .
    (_)? @_.trailing.end.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(aaa, bbb)
;;!      ^^^  ^^^
(
  (argument_list
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    ","? @_.trailing.start.endOf
    .
    (_)? @_.trailing.end.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! " ".join(word for word in word_list)
;;!!          ^^^^^^^^^^^^^^^^^^^^^^^^^^
(call
  (generator_expression
    "(" @argumentOrParameter.start.endOf
    ")" @argumentOrParameter.end.startOf
  )
)

;;!! " ".join(word for word in word_list)
;;!!          ^^^^^^^^^^^^^^^^^^^^^^^^^^
(call
  (generator_expression
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! lambda _: pass
;;!  ^^^^^^^^^^^^^^
(lambda) @anonymousFunction

;;!! lambda a, b: pass
;;!         ^^^^
(lambda
  (lambda_parameters) @argumentList @argumentOrParameter.iteration
  (#insertion-delimiter! @argumentList ", ")
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! lambda: pass
(lambda
  .
  "lambda" @argumentList.start.endOf
  .
  ":"
  (#insertion-delimiter! @argumentList.start.endOf " ")
) @argumentList.domain

;;!! def foo(aaa, bbb): pass
;;!          ^^^^^^^^
(_
  (parameters
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo (aaa, bbb)
;;!       ^^^^^^^^
(_
  (argument_list
    "(" @argumentList.removal.start.endOf @argumentOrParameter.iteration.start.endOf
    ")" @argumentList.removal.end.startOf @argumentOrParameter.iteration.end.startOf
  ) @argumentList
  (#empty-single-multi-delimiter! @argumentList @argumentList "" ", " ",\n")
  (#child-range! @argumentList 1 -2)
) @argumentList.domain @argumentOrParameter.iteration.domain

;;!! foo (aaa=1, bbb=2)
;;!       ^^^^^^^^^^^^
(argument_list
  "(" @name.iteration.start.endOf @value.iteration.start.endOf
  ")" @name.iteration.end.startOf @value.iteration.end.startOf
)

operators: [
  "<"
  "<="
  ">"
  ">="
] @disqualifyDelimiter

operator: [
  "<<"
  "<<="
  ">>"
  ">>="
] @disqualifyDelimiter

(function_definition
  "->" @disqualifyDelimiter
)

(
  (string_start) @pairDelimiter
  (#match? @pairDelimiter "^[a-zA-Z]+")
)
