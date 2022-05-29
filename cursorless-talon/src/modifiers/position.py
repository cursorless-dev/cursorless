from typing import Any

from talon import Context, Module

mod = Module()
ctx = Context()

POSITION_BEFORE = {
    "before": {
        "type": "position",
        "position": "before",
    }
}

POSITION_AFTER = {
    "after": {"type": "position", "position": "after"},
}

positions = {
    "before": {"position": "before"},
    "after": {"position": "after"},
    "start of": {"position": "start"},
    "end of": {"position": "end"},
    # Disabled for now because "below" can misrecognize with "blue" and we may move away from allowing positional modifiers in arbitrary places anyway
    # "above": {"position": "before", **LINE.json_repr},
    # "below": {"position": "after", **LINE.json_repr}
}

mod.list("cursorless_position", desc="Types of positions")
ctx.lists["self.cursorless_position"] = positions.keys()


@mod.capture(rule="{user.cursorless_position}")
def cursorless_position(m) -> dict[str, Any]:
    return {
        "type": "position",
        **positions[m.cursorless_position],
    }
