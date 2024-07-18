from talon import Module

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
