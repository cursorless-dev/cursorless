defmodule MyApp.Mod do
  alias MyApp.Car
​
  @model_regex ~r/^[A-Z][a-Z]*$/
​
  @doc """
  This is a function.
​
  ## People use markdown in docstrings usually
    * So lists
    * And inline code for arguments like `color` is common
  """
  def database_call(color) do
    query =
      from(c in Car,
        where:
          c.make == :toyota or
            fragment("lower(?) like ?", s.color, ^"#{color}%")
      )
​
    results =
      query
      |> Repo.all()
      |> Enum.filter(fn
        %{color: :unknown} -> false
        c -> c.make == Application.fetch_env!(__MODULE__, :make_filter)
      end)
      |> Enum.map(&[&1.model, &1.color])
​
    Enum.at(results, 0).model =~ @model_regex
  end
end
​
defmodule MyApp.Car do
  @moduledoc """
  A database model
  """
  use Ecto.Schema
  import Ecto.Changeset
​
  schema "cars" do
    field(:color, Ecto.Enum,
      values: [:blue, :unknown, :green, :silver, :black, :yellow, :red, :white]
    )
​
    field(:model, :string)
    field(:make, :string)
​
    belongs_to(:owner, MyApp.Person)
​
    timestamps()
  end
​
  def changeset(sign, attrs) do
    required_fields = [
      :make,
      :model
    ]
​
    optional_fields = [
      :owner
    ]
​
    sign
    |> cast(attrs, required_fields ++ optional_fields)
    |> validate_required(required_fields)
    |> foreign_key_constraint(:people, name: :cars_owned_by_fkey)
  end
end
