from typing import Any

from talon import Module

mod = Module()

mod.list("cursorless_position_modifier", desc='Positions such as "startOf" and "endOf"')


@mod.capture(rule="{user.cursorless_position_modifier}")
def cursorless_position_modifier(m) -> dict[str, Any]:
    return {"type": "startOf" if m.cursorless_position_modifier == "start" else "endOf"}
