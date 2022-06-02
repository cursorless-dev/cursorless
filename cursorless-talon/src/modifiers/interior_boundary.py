from talon import Module

mod = Module()

mod.list(
    "cursorless_interior_boundary",
    desc="Inside or boundary delimiter inclusion",
)


@mod.capture(rule="{user.cursorless_interior_boundary}")
def cursorless_interior_boundary(m) -> dict[str, str]:
    """Inside or boundary delimiter inclusion"""
    return {
        "type": m.cursorless_interior_boundary,
    }
