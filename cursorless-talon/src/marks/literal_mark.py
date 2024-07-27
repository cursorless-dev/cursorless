from talon import Module

from .mark_types import LiteralMark

mod = Module()


# TODO: Replace literal *heh* with a Talon list
@mod.capture(rule=("literal <user.text>"))
def cursorless_literal_mark(m) -> LiteralMark:
    return {
        "type": "literal",
        "text": m.text,
    }
