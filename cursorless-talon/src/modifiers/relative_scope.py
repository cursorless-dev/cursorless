from typing import Any

from talon import Module

mod = Module()


@mod.capture(rule="(previous | next) <user.cursorless_scope_type>")
def cursorless_relative_scope(m) -> dict[str, Any]:
    """Previous/next scope"""
    return {
        "type": "relativeScope",
        "scopeType": m.cursorless_scope_type,
        "offset": 1,
        "length": 1,
        "direction": "backward" if m[0] == "previous" else "forward",
    }
