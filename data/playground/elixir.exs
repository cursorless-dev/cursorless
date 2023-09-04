defmodule Elixir do
  def elixir(x, something) when something = "inside" do
    IO.inspect(Enum.count([Integer.digits(532), 2, 3]))
  end
end


[
  %{:a => "lorem",
  # comment
  "b" => "ipsum",
  # other comment
  3 => "dolor"},
  [keyword: "list", foo: :bar]
]
