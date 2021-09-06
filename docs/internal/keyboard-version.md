### Without modifier keys

- `tda` => "take air" (ie "take default air")
- `tga` => "take green air"
- ? `tfda` => "take fox air" (ie "take fox default air")
  - or `tsfda` => "take fox air" (ie "take shape fox default air")
- ? `tfga` => "take fox green air"
- `tfda` => "take funk air"
- `tft` => "take funk" (ie "take funk this")
- ? `tf<pause>` => "take funk"
- `tldadbl` -> "take air and bat"
  - Note that the `l` is used both to start and end a list
- `trdadb` -> "take air past bat"
  - Note that the range ends on its own because you've defined the start and end
- `tlrdadbdcl` -> "take air past bat and cap"

### To do / think about

- [ ] Actions with multiple targets. I think for these you can just treat it kinda like a range target, where you just wait for another target after they've specified the first one, and then execute command after they've specified both
- [ ] Figure out how "character" context works. I don't think we need an actual map literal for that one, because it woul basically be the identity mapping 😊. But it should prob be a proper context in the sense of the keyboard mapping / vscode thing
- [ ] For `toggleList`, note that in case you're ending a list, you don't really necessarily transition to a `target` context, because you might have just ended the command (unless it had multiple targets). I don't think this one is a big deal; implementation will prob just ignore the `nextContext` in this case
- [ ] What to do about multi-char sequences for eg scope types? We won't be able to have every scope type be one char. So we could either define them as two-char elements in the top-level target map, or have it so that the prefix char for them puts us into a new context where we're specifying a scope type

Advantage of having context to specify scope type is that then we can use it for "every", as well as next-gen scope modifiers, eg "first funk", "last funk", etc.

- [ ] Maybe we should use `l` for "line" instead of "list". Then need to figure out different key for "list".

### Action context

- Every letter is an action => `targetContext`

### Target context

- `a`:
- `b`:
- `c`:
- `d`: default color => `characterContext`
- `e`:
- `f`:
- `g`: green => `characterContext`
- `h`:
- `i`:
- `j`:
- `k`:
- `l`:
- `m`:
- `n`:
- `o`:
- `p`:
- `q`:
- `r`: red => `characterContext`
- `s`:
- `t`:
- `u`:
- `v`:
- `w`:
- `x`:
- `y`:
- `z`:

### With modifier keys

- `ta` => "take air"
- `tGa` => "take green air"
