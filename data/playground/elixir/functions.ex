defmodule Funcs do
  def no_args() do
  end

  def no_args_no_parens do
  end

  def one_arg(x) do
    x
  end

  def one_arg_no_parens(x) do
    x
  end

  def two_args(x, y) do
    x + y
  end

  def two_args_no_parens(x, y) do
    x + y
  end

  def default_args_no_parens(x, y \\ 1) do
    x + y
  end

  def default_args(x, y \\ 1) do
    x + y
  end

  def do_block(), do: 1
  def do_block(x), do: x

  def pattern_matching([{x, y} | tail]) do
    x + y
  end

  def one_guard(x) when x == 1 do
    x
  end

  def multiple_guard(x) when x > 10 when x < 5 do
    x
  end

  defp private(x) do
    x
  end

  defmacro macro(x) do
    quote do
      [unquote(x)]
    end
  end

  defguard guard(term) when is_integer(term) and rem(term, 2) == 0

  def unquote(name)(unquote_splicing(args)) do
    unquote(compiled)
  end
end
