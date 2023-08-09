from typing import Any

from talon import Module

mod = Module()


@mod.capture(
    rule=(
        "<user.cursorless_decorated_symbol> | "
        "<user.cursorless_simple_mark> |"
        "<user.cursorless_line_number>"  # row (ie absolute mod 100), up, down
    )
)
def cursorless_mark(m) -> dict[str, Any]:
    try:
        return m.cursorless_decorated_symbol
    except AttributeError:
        pass
    try:
        return m.cursorless_simple_mark
    except AttributeError:
        pass
    return m.cursorless_line_number
