from typing import Any

from talon import Module

every_modifiers = {"every": "every"}

mod = Module()

mod.list("cursorless_every_modifier", desc="Cursorless every modifiers")


@mod.capture(rule="[{user.cursorless_every_modifier}] <user.cursorless_scope_type>")
def cursorless_containing_scope(m) -> dict[str, Any]:
    """Expand to containing scope"""
    return {
        "type": "everyScope" if m[0] == "every" else "containingScope",
        "scopeType": m.cursorless_scope_type,
    }
