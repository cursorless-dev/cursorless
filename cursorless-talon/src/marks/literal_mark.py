from talon import Context, Module

from .mark_types import LiteralMark

mod = Module()

mod.list("private_cursorless_literal_mark", desc="Cursorless literal mark")

# This is a private tag and should not be used by non Cursorless developers
mod.tag(
    "private_cursorless_literal_mark_no_prefix",
    desc="Tag for enabling literal mark without prefix",
)

ctx_no_prefix = Context()
ctx_no_prefix.matches = r"""
tag: user.private_cursorless_literal_mark_no_prefix
"""


# NB: <phrase> is used over <user.text> for DFA performance reasons
# (we intend to replace this with a dynamic list of document contents eventually)
@mod.capture(rule="{user.private_cursorless_literal_mark} <phrase>")
def cursorless_literal_mark(m) -> LiteralMark:
    return construct_mark(str(m.phrase))


@ctx_no_prefix.capture("user.cursorless_literal_mark", rule="<phrase>")
def cursorless_literal_mark_no_prefix(m) -> LiteralMark:
    return construct_mark(str(m.phrase))


def construct_mark(text: str) -> LiteralMark:
    return {
        "type": "literal",
        "modifier": {
            "type": "preferredScope",
            "scopeType": {
                "type": "customRegex",
                "regex": construct_fuzzy_regex(text),
                "flags": "gui",
            },
        },
    }


def construct_fuzzy_regex(text: str) -> str:
    parts = text.split(" ")
    # Between each word there can be any number of non-alpha symbols (including escape characters: \t\r\n). No separator at all is also valid -- for example, when searching for a camelCase identifier.
    return r"([^a-zA-Z]|\\[trn])*".join(parts)
