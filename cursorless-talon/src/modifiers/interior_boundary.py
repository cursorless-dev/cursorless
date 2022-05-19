from talon import Module

mod = Module()

mod.list(
    "cursorless_delimiter_inclusion",
    desc="Inside or boundary delimiter inclusion",
)


@mod.capture(rule="{user.cursorless_delimiter_inclusion}")
def cursorless_delimiter_inclusion(m) -> dict[str, str]:
    """Inside or boundary delimiter inclusion"""
    return {
        "type": m.cursorless_delimiter_inclusion,
    }
