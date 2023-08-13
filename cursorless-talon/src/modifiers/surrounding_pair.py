from contextlib import suppress
from typing import Any

from talon import Context, Module

mod = Module()
ctx = Context()


mod.list(
    "cursorless_delimiter_force_direction",
    desc="Can be used to force an ambiguous delimiter to extend in one direction",
)
ctx.lists["user.cursorless_delimiter_force_direction"] = [
    "left",
    "right",
]

mod.list(
    "cursorless_surrounding_pair_scope_type",
    desc="Scope types that can function as surrounding pairs",
)


@mod.capture(
    rule=(
        "<user.cursorless_selectable_paired_delimiter> |"
        "{user.cursorless_surrounding_pair_scope_type}"
    )
)
def cursorless_surrounding_pair_scope_type(m) -> str:
    """Surrounding pair scope type"""
    try:
        return m.cursorless_surrounding_pair_scope_type
    except AttributeError:
        return m.cursorless_selectable_paired_delimiter


@mod.capture(
    rule="[{user.cursorless_delimiter_force_direction}] <user.cursorless_surrounding_pair_scope_type>"
)
def cursorless_surrounding_pair(m) -> dict[str, Any]:
    """Expand to containing surrounding pair"""
    try:
        surrounding_pair_scope_type = m.cursorless_surrounding_pair_scope_type
    except AttributeError:
        surrounding_pair_scope_type = "any"

    scope_type = {
        "type": "surroundingPair",
        "delimiter": surrounding_pair_scope_type,
    }

    with suppress(AttributeError):
        scope_type["forceDirection"] = m.cursorless_delimiter_force_direction

    return {
        "type": "containingScope",
        "scopeType": scope_type,
    }
