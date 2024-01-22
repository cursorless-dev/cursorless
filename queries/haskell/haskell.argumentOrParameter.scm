;; argumentOrParameter: actual argument
(pat_apply) @argumentOrParameter
(pat_as) @argumentOrParameter
(pat_field) @argumentOrParameter
(pat_fields) @argumentOrParameter
(pat_infix) @argumentOrParameter
(pat_irrefutable) @argumentOrParameter
(pat_list) @argumentOrParameter
(pat_literal) @argumentOrParameter
(pat_name) @argumentOrParameter
(pat_negation) @argumentOrParameter
(pat_parens) @argumentOrParameter
(pat_record) @argumentOrParameter
(pat_strict) @argumentOrParameter
(pat_tuple) @argumentOrParameter
(pat_typed) @argumentOrParameter
(pat_unboxed_tuple) @argumentOrParameter
(pat_view) @argumentOrParameter
(pat_wildcard) @argumentOrParameter

;; argumentOrParameter: formal argument
(exp_apply
  .
  (_)
  (_) @argumentOrParameter
)
