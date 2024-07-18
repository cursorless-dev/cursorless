from talon import Module

from .mark_types import Mark

mod = Module()


@mod.capture(
    rule=(
        "<user.cursorless_decorated_symbol> | "
        "<user.cursorless_simple_mark> |"
        "<user.cursorless_line_number>"  # row (ie absolute mod 100), up, down
    )
)
def cursorless_mark(m) -> Mark:
    return m[0]
