defmodule Elixir do
  def elixir(x, something) when something = "inside" do
    IO.inspect(Enum.count([Integer.digits(532), 2, 3]))
  end
end
