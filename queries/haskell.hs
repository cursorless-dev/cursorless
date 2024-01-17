module Main where

-- This is a comment.
main :: IO ()
main = putStrLn "Hello, World!"

-- RFC: What should `argumentOrParameter` match?
fst :: (a, b) -> a
fst tup@(x, y) = x
--  ^^^^^^^^^^     <- 1️⃣ the whole pattern
--  ^^^            <- 2️⃣ only the name of the whole argument, if given
--  ^^^  ^  ^      <- 3️⃣ all names in the pattern
