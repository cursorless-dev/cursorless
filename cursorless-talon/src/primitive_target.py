from typing import Any

from talon import Module

mod = Module()

BASE_TARGET: dict[str, Any] = {"type": "primitive"}
IMPLICIT_TARGET = {"type": "primitive", "isImplicit": True}


modifiers = [
    "<user.cursorless_position>",  # before, end of
    "<user.cursorless_head_tail>",  # head, tail
    "<user.cursorless_containing_scope>",  # funk, state, class
    "<user.cursorless_subtoken_scope>",  # first past second word
    "<user.cursorless_surrounding_pair>",  # matching/pair [curly, round]
    "<user.cursorless_to_raw_selection>",  # just
    "<user.cursorless_delimiter_inclusion>",  # inside, bounds
    "<user.cursorless_delimiter_range>",  # leading, trailing
]


@mod.capture(rule="|".join(modifiers))
def cursorless_modifier(m) -> str:
    """Cursorless modifier"""
    return m[0]


@mod.capture(
    rule="<user.cursorless_modifier>+ [<user.cursorless_mark>] | <user.cursorless_mark>"
)
def cursorless_primitive_target(m) -> dict[str, Any]:
    """Supported extents for cursorless navigation"""
    result = BASE_TARGET.copy()

    try:
        result["mark"] = m.cursorless_mark
    except AttributeError:
        pass

    try:
        result["modifiers"] = m.cursorless_modifier_list
    except AttributeError:
        pass

    return result
