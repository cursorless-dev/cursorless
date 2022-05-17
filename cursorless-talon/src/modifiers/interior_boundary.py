from typing import Any
from talon import Module

mod = Module()

mod.list(
    "cursorless_delimiter_inclusion",
    desc="Inside or boundary delimiter inclusion",
)

# TODO [{user.cursorless_delimiter_force_direction}]
@mod.capture(rule="{user.cursorless_delimiter_inclusion}")
def cursorless_delimiter_inclusion(m) -> dict[str, Any]:
    """Inside or boundary delimiter inclusion"""
    return {
        "type": m.cursorless_delimiter_inclusion,
    }
