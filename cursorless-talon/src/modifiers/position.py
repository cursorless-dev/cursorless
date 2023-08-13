from typing import Any

from talon import Module

mod = Module()

mod.list("cursorless_position", desc='Positions such as "before", "after" etc')


@mod.capture(rule="{user.cursorless_position}")
def cursorless_position_modifier(m) -> dict[str, Any]:
    return {"type": "startOf" if m.cursorless_position == "start" else "endOf"}
