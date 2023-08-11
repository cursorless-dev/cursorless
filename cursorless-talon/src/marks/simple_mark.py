from talon import Module

mod = Module()

mod.list("cursorless_simple_mark", desc="Cursorless simple marks")

# Maps from the id we use in the spoken form csv to the modifier type
# expected by Cursorless extension
simple_marks = {
    "currentSelection": "cursor",
    "previousTarget": "that",
    "previousSource": "source",
    "nothing": "nothing",
}


@mod.capture(rule="{user.cursorless_simple_mark}")
def cursorless_simple_mark(m) -> dict[str, str]:
    return {
        "type": simple_marks[m.cursorless_simple_mark],
    }
