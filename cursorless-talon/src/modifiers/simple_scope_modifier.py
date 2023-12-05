from typing import Any

from talon import Module

mod = Module()

mod.list(
    "cursorless_simple_scope_modifier",
    desc='Cursorless simple scope modifiers, eg "every"',
)


@mod.capture(
    rule="[{user.cursorless_simple_scope_modifier}] <user.cursorless_scope_type>"
)
def cursorless_simple_scope_modifier(m) -> dict[str, Any]:
    """Containing scope, every scope, etc"""
    match m[0]:
        case "every":
            type = "everyScope"
        case "contiguous":
            type = "contiguousScope"
        case _:
            type = "containingScope"

    return {
        "type": type,
        "scopeType": m.cursorless_scope_type,
    }
