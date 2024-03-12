from typing import Any

from talon import Module

mod = Module()

mod.list(
    "cursorless_every_scope_modifier",
    desc="Cursorless every scope modifiers",
)
mod.list(
    "cursorless_ancestor_scope_modifier",
    desc="Cursorless ancestor scope modifiers",
)


@mod.capture(
    rule=(
        "[{user.cursorless_every_scope_modifier} | {user.cursorless_ancestor_scope_modifier}] "
        "<user.cursorless_scope_type>"
    ),
)
def cursorless_simple_scope_modifier(m) -> dict[str, Any]:
    """Containing scope, every scope, etc"""
    if hasattr(m, "cursorless_every_scope_modifier"):
        return {
            "type": "everyScope",
            "scopeType": m.cursorless_scope_type,
        }

    if hasattr(m, "cursorless_ancestor_scope_modifier"):
        return {
            "type": "containingScope",
            "scopeType": m.cursorless_scope_type,
            "ancestorIndex": 1,
        }

    return {
        "type": "containingScope",
        "scopeType": m.cursorless_scope_type,
    }
