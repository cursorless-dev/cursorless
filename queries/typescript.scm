;; import typescript.core.scm

;; Define this here because type assertions don't exist in TSX because
;; they are not valid JSX.
;;!! <Aaa>bbb
;;!   ^^^
;;!  xxxxx
;;!  --------
(type_assertion
  (type_arguments
    (_) @type
  ) @_.removal
) @_.domain
