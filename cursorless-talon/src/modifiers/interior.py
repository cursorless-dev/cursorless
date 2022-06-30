from talon import Module

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
interior_modifiers = {
    "inside": "interiorOnly",
}

mod = Module()

mod.list(
    "cursorless_interior_modifier",
    desc="Cursorless interior modifier",
)


@mod.capture(rule="{user.cursorless_interior_modifier}")
def cursorless_interior_modifier(m) -> dict[str, str]:
    """Cursorless interior modifier"""
    return {
        "type": m.cursorless_interior_modifier,
    }
