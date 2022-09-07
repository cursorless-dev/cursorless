from contextlib import suppress
from typing import Any

from talon import Module

mod = Module()

BASE_TARGET: dict[str, Any] = {"type": "primitive"}
IMPLICIT_TARGET = {"type": "primitive", "isImplicit": True}


@mod.capture(
    rule=(
        "[<user.cursorless_position>] "
        "(<user.cursorless_modifier>+ [<user.cursorless_mark>] | <user.cursorless_mark>)"
    )
)
def cursorless_primitive_target(m) -> dict[str, Any]:
    """Supported extents for cursorless navigation"""
    result = BASE_TARGET.copy()

    modifiers = [
        *getattr(m, "cursorless_position_list", []),
        *getattr(m, "cursorless_modifier_list", []),
    ]

    if modifiers:
        result["modifiers"] = modifiers

    with suppress(AttributeError):
        result["mark"] = m.cursorless_mark

    return result
