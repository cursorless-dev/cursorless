(element
    (start_tag) @.interior.start @.boundary
    (end_tag) @.interior.end @.boundary
    ; What happens with these two boundary elements?
    (#make-range! @.interior.start @.interior.end ".interior" true true)
    ; Note that the final `true true` means to exclude start and end node of range
) @element

; Alternately:
(element
    (start_tag) @.interior.startExclusive @.boundary
    (end_tag) @.interior.endExclusive @.boundary
) @element

(element (self_closing_tag)) @element
