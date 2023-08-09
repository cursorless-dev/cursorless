from typing import Any

from talon import Module, actions


mod = Module()

mod.list("cursorless_special_mark", desc="Cursorless special marks")

# Maps from the id we use in the spoken form csv to the modifier type
# expected by Cursorless extension
special_marks = {
    "currentSelection": "cursor",
    "previousTarget": "that",
    "previousSource": "source",
    "nothing": "nothing",
}


@mod.capture(rule="{user.cursorless_special_mark}")
def cursorless_special_mark(m) -> dict[str, str]:
    return {"type": special_marks[m.cursorless_special_mark]}


@mod.capture(
    rule=(
        "<user.cursorless_decorated_symbol> | "
        "<user.cursorless_special_mark> |"
        "<user.cursorless_line_number>"  # row (ie absolute mod 100), up, down
    )
)
def cursorless_mark(m) -> dict[str, Any]:
    try:
        return m.cursorless_decorated_symbol
    except AttributeError:
        pass
    try:
        return m.cursorless_special_mark
    except AttributeError:
        pass
    return m.cursorless_line_number
