from talon import Context, Module

mod = Module()
ctx = Context()


positions = {
    "start of": {"position": "before", "insideOutsideType": "inside"},
    "end of": {"position": "after", "insideOutsideType": "inside"},
    # Disabled for now because "below" can misrecognize with "blue" and we may move away from allowing positional modifiers in arbitrary places anyway
    # "above": {"position": "before", **LINE.json_repr},
    # "below": {"position": "after", **LINE.json_repr}
}

mod.list("cursorless_position", desc="Types of positions")
ctx.lists["self.cursorless_position"] = positions.keys()


@mod.capture(rule="{user.cursorless_position}")
def cursorless_position(m) -> str:
    return positions[m.cursorless_position]
