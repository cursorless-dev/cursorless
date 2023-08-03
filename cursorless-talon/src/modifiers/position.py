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
}
before_after = {
    "before": "before",
    "after": "after",
}


@mod.capture(rule="{user.cursorless_position}")
def cursorless_position_modifier(m) -> dict[str, Any]:
    return {"type": "startOf" if m.cursorless_position == "start" else "endOf"}


def on_ready():
    init_csv_and_watch_changes(
        "positions",
        {
            "position": positions,
            "insertion_mode_pos": before_after,
        },
    )


app.register("ready", on_ready)
