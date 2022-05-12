from typing import Any

from talon import Module

mod = Module()


mod.list("cursorless_selection_type", desc="Types of selection_types")


@mod.capture(rule="{user.cursorless_selection_type}")
def cursorless_selection_type(m) -> dict[str, Any]:
    # TODO: Change this to containing scope next
    return {"type": "selectionType", "selectionType": m.cursorless_selection_type}
