(object) @map

(arrow_function) @anonymousFunction
(function) @anonymousFunction

; We could also have used an alternation here, but the above style is clean and
; seems to be more commonly used.
; [
;     (arrow_function)
;     (function)
; ] @anonymousFunction 

; The following doesn't work because we can't have a `(` before the field name (`key`)
; (
;     (object
;         (pair
;             (key: (_) @key
;             .
;             ":") @key.removalRange
;         ) @key.searchScope
;     ) @key.iterationScope
; )

; As a workaround, we could allow defining the end of an annotation
(
    (object
        (pair
            key: (_) @key
            .
            ":" @key.removalRange.end
        ) @key.searchScope
    ) @key.iterationScope
)

; We could instead tag the delimiter itself.  Gives us a bit more information,
; so maybe that's better?
(
    (object
        (pair
            key: (_) @key
            .
            ":" @key.delimiter.trailing)
        @key.searchScope)
    @key.iterationScope)

; We could also try setting an attribute.  This approach is likely how we'd
; handle comma-separated lists, because they'd be a bit painful to define as
; parse tree patterns
(
    (object
        (pair
            key: (_) @key
            (#set! "delimiter" ":")
        )
        @key.searchScope)
    @key.iterationScope)
