{-# LANGUAGE LambdaCase #-}
{-# OPTIONS_GHC -Wno-unrecognised-pragmas #-}
{-# HLINT ignore "Redundant lambda" #-}
module Main where

-- This is a comment.
main :: IO ()
main = putStrLn "Hello, World!"

-- RFC: What should "arg" match?
fst :: (a, b) -> a
fst tup@(x, y) = x
--  ^^^^^^^^^^     <- 1️⃣ the whole pattern
--  ^^^            <- 2️⃣ only the name of the whole argument, if given
--  ^^^  ^  ^      <- 3️⃣ all names in the pattern

uncurry :: (a -> b -> c) -> (a, b) -> c
uncurry f = \(x, y) -> f x y
--          ^^^^^^^^^^^^^^^^ <- "lambda"
--                     ^^^^^ <- "inside lambda"
--           ^^^^^^          <- "pattern lambda"

fromEither :: (a -> c) -> (b -> c) -> Either a b -> c
fromEither f g = \case
  Left x -> f x
  Right y -> g y

foo = bar
  where
    bar = 1
