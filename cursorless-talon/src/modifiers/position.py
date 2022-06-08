from typing import Any

from talon import Context, Module, app

from ..csv_overrides import init_csv_and_watch_changes

mod = Module()
ctx = Context()

mod.list("cursorless_position", desc='Positions such as "before", "after" etc')

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
positions = {
    "start of": "start",
    "end of": "end",
    "before": "before",
    "after": "after",
}


def construct_positional_modifier(position: str) -> dict:
    return {"type": "position", "position": position}


# Note that we allow positional connectives such as "before" and "after" to appear
# as modifiers. We may disallow this in the future.
@mod.capture(rule="{user.cursorless_position}")
def cursorless_position(m) -> dict[str, Any]:
    return construct_positional_modifier(m.cursorless_position)


def on_ready():
    init_csv_and_watch_changes(
        "positions",
        {"position": positions},
    )


app.register("ready", on_ready)
