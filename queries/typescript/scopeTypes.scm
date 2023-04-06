(if_statement consequence: (_) )
(if_statement
   consequence: [
      (statement_block
         (_)* @.interior
         ; What happens with this range?
      )
      (_) @.interior
      ; This is for `if (foo) bar();`
      ; Does this one only match if above doesn't?
   ]
) @ifStatement
