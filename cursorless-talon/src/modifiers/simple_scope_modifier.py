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
    if hasattr(m, "cursorless_simple_scope_modifier"):
        modifier = m.cursorless_simple_scope_modifier

        if modifier == "every":
            return {
                "type": "everyScope",
                "scopeType": m.cursorless_scope_type,
            }

        if modifier == "ancestor":
            return {
                "type": "containingScope",
                "scopeType": m.cursorless_scope_type,
                "ancestorIndex": 1,
            }

    return {
        "type": "containingScope",
        "scopeType": m.cursorless_scope_type,
    }
