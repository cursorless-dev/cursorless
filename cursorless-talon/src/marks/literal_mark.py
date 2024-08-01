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
                "regex": construct_fuzzy_regex(m.text),
                "flags": "gui",
            },
        },
    }


def construct_fuzzy_regex(text: str) -> str:
    parts = text.split(" ")
    # Between each word there can be nothing(camelCase) or a non character symbol.
    # Escape characters. eg: \t\r\n, are also acceptable.
    return r"([^a-zA-Z]|\\[trn])*".join(parts)
