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
    return {
        "type": "everyScope" if m[0] == "every" else "containingScope",
        "scopeType": m.cursorless_scope_type,
    }
