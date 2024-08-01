from talon import Module

from .mark_types import LiteralMark

mod = Module()


# FIXME: Replace literal *heh* with a Talon list before we make this public
@mod.capture(rule=("literal <user.text>"))
def cursorless_literal_mark(m) -> LiteralMark:
    return {
        "type": "literal",
        "modifier": {
            "type": "preferredScope",
            "scopeType": {
                "type": "customRegex",
                "regex": m.text,
                "flags": "gui",
            },
        },
    }
