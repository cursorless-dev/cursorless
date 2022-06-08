from contextlib import suppress
from typing import Any

from talon import Module

mod = Module()

BASE_TARGET: dict[str, Any] = {"type": "primitive"}
IMPLICIT_TARGET = {"type": "primitive", "isImplicit": True}


# NB: We don't include positions here because we require them to be first so
# that we don't end up with ambiguity.
# See https://github.com/cursorless-dev/cursorless/issues/747
modifiers = [
    "<user.cursorless_simple_modifier>",  # eg inside, bounds, just, head, tail, leading, trailing
    "<user.cursorless_containing_scope>",  # funk, state, class
    "<user.cursorless_subtoken_scope>",  # first past second word
    "<user.cursorless_surrounding_pair>",  # matching/pair [curly, round]
]


@mod.capture(rule="|".join(modifiers))
def cursorless_modifier(m) -> str:
    """Cursorless modifier"""
    return m[0]


# NB: We require positions to be first so that we don't end up with ambiguity
# See https://github.com/cursorless-dev/cursorless/issues/747
@mod.capture(
    rule=(
        "[<user.cursorless_position>] "
        "(<user.cursorless_modifier>+ [<user.cursorless_mark>] | <user.cursorless_mark>)"
    )
)
def cursorless_primitive_target(m) -> dict[str, Any]:
    """Supported extents for cursorless navigation"""
    result = BASE_TARGET.copy()

    modifiers = [
        *getattr(m, "cursorless_position_list", []),
        *getattr(m, "cursorless_modifier_list", []),
    ]

    if modifiers:
        result["modifiers"] = modifiers

    with suppress(AttributeError):
        result["mark"] = m.cursorless_mark

    return result
