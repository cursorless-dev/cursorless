-- RFC: What should "arg" match?
fst :: (a, b) -> a
fst tup@(x, y) = x
--  ^^^^^^^^^^     <- 1️⃣ the whole pattern
--  ^^^            <- 2️⃣ only the name of the whole argument, if given
--  ^^^  ^  ^      <- 3️⃣ all names in the pattern

-- RFC: What should "branch" match?
foo = bar
  where
    bar = 1
--   1️⃣ `foo = bar` and `bar = 1`
--   2️⃣ `foo = bar where bar = 1`
--   3️⃣ `foo = bar where bar = 1` and `bar = 1`
