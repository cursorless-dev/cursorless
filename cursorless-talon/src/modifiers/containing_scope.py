from typing import Any

from talon import Module

mod = Module()


@mod.capture(rule="[every] <user.cursorless_scope_type>")
def cursorless_containing_scope(m) -> dict[str, Any]:
    """Expand to containing scope"""
    return {
        "type": "everyScope" if m[0] == "every" else "containingScope",
        "scopeType": m.cursorless_scope_type,
    }
