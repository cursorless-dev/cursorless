from talon import Module

mod = Module()

mod.list(
    "cursorless_range_type",
    desc="A range modifier that indicates the specific type of the range",
)

# Maps from the id we use in the spoken form csv to the modifier type
# expected by Cursorless extension
range_type_map = {
    "verticalRange": "vertical",
}


@mod.capture(rule="{user.cursorless_range_type}")
def cursorless_range_type(m) -> str:
    """Range type modifier"""
    return range_type_map[m.cursorless_range_type]
