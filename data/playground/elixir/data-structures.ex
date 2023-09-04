defmodule DataStructures do
  []
  [a]
  [A]
  [1]
  [1, 2]
  [[1], 1]
  %{}
  %{a: 1, b: 2}
  %{:a => 1, "b" => 2, c => 3}
  # NOTE: this is troublesome for the queries, there are commas at two different levels
  %{"a" => 1, b: 2, c: 3}
  %{user | name: "Jane", email: "jane@example.com"}
  %{user | "name" => "Jane"}
  %AStruct{a: 1, b: 2}
  %AnotherStruct{:a => 1, "b" => 2, c => 3}
  %ThirdStruct{"a" => 1, b: 2, c: 3}
  %User{user | name: "Jane", email: "jane@example.com"}
  %User{user | "name" => "Jane"}
  %_{}
  %name{}
  %^name{}
  %__MODULE__{}
  %__MODULE__.Child{}
  %:"Elixir.Mod"{}
  %fun(){}
  %Mod.fun(){}
  %fun.(){}
  {}
  {1}
  {1, 2}
end
