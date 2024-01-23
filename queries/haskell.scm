;; import haskell/haskell.argumentOrParameter.scm
;; import haskell/haskell.argumentOrParameter.iteration.scm
;; import haskell/haskell.branch.scm
;; import haskell/haskell.branch.iteration.scm
;; import haskell/haskell.functionName.scm
;; import haskell/haskell.name.function.scm
;; import haskell/haskell.namedFunction.scm

;; Short declarations are below.

;; anonymousFunction
(exp_lambda) @anonymousFunction
(exp_lambda_case) @anonymousFunction

;; functionCall
(exp_apply) @functionCall
(exp_type_application)  @functionCall
(pat_apply) @functionCall
(type_apply) @functionCall

;; functionCallee
(exp_apply . (_) @functionCallee)
(exp_type_application . (_) @functionCallee)
(pat_apply . (_) @functionCallee
(type_apply . (_) @functionCallee)

;; list
(exp_list) @list
(exp_list_comprehension) @list
(exp_tuple) @list
(exp_unboxed_tuple) @list
(pat_list) @list
(pat_tuple) @list
(pat_unboxed_tuple) @list
(type_tuple) @list
(type_unboxed_tuple) @list

;; map
(exp_record) @map
(pat_record) @map

;; string
(string) @string
(char) @string
