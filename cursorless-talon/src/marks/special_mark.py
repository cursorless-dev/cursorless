from talon import Module

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
    return {
        "type": special_marks[m.cursorless_special_mark],
    }
