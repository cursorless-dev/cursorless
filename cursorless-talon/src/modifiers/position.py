from typing import Any

from talon import Context, Module

mod = Module()
ctx = Context()

mod.list("cursorless_position", desc="Types of positions")
ctx.lists["self.cursorless_position"] = {
    "start of": "start",
    "end of": "end",
}


def construct_positional_modifier(position: str) -> dict:
    return {"type": "position", "position": position}


# Note that we allow positional connectives such as "before" and "after" to appear
# as modifiers. We may disallow this in the future.
@mod.capture(
    rule="{user.cursorless_position} | {user.cursorless_positional_connective}"
)
def cursorless_position(m) -> dict[str, Any]:
    try:
        position = m.cursorless_position
    except AttributeError:
        position = m.cursorless_positional_connective

    return construct_positional_modifier(position)
