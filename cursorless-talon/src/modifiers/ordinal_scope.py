from typing import Any

from talon import Module

from ..targets.range_target import RangeConnective

mod = Module()

mod.list("cursorless_first_modifier", desc="Cursorless first modifiers")
mod.list("cursorless_last_modifier", desc="Cursorless last modifiers")


@mod.capture(
    rule="<user.ordinals_small> | [<user.ordinals_small>] {user.cursorless_last_modifier}"
)
def ordinal_or_last(m) -> int:
    """An ordinal or the word 'last'"""
    if m[-1] == "last":
        return -getattr(m, "ordinals_small", 1)
    return m.ordinals_small - 1


@mod.capture(
    rule="<user.ordinal_or_last> [<user.cursorless_range_connective> <user.ordinal_or_last>] <user.cursorless_scope_type>"
)
def cursorless_ordinal_range(m) -> dict[str, Any]:
    """Ordinal range"""
    anchor = create_ordinal_scope_modifier(
        m.cursorless_scope_type, m.ordinal_or_last_list[0]
    )
    if len(m.ordinal_or_last_list) > 1:
        active = create_ordinal_scope_modifier(
            m.cursorless_scope_type, m.ordinal_or_last_list[1]
        )
        range_connective: RangeConnective = m.cursorless_range_connective
        return {
            "type": "range",
            "anchor": anchor,
            "active": active,
            "excludeAnchor": range_connective.excludeAnchor,
            "excludeActive": range_connective.excludeActive,
        }
    return anchor


@mod.capture(
    rule="({user.cursorless_first_modifier} | {user.cursorless_last_modifier}) <user.private_cursorless_number_small> <user.cursorless_scope_type_plural>"
)
def cursorless_first_last(m) -> dict[str, Any]:
    """First/last `n` scopes; eg "first three funks"""
    if m[0] == "first":
        return create_ordinal_scope_modifier(
            m.cursorless_scope_type_plural, 0, m.private_cursorless_number_small
        )
    return create_ordinal_scope_modifier(
        m.cursorless_scope_type_plural,
        -m.private_cursorless_number_small,
        m.private_cursorless_number_small,
    )


@mod.capture(rule="<user.cursorless_ordinal_range> | <user.cursorless_first_last>")
def cursorless_ordinal_scope(m) -> dict[str, Any]:
    """Ordinal ranges such as subwords or characters"""
    return m[0]


def create_ordinal_scope_modifier(scope_type: dict, start: int, length: int = 1):
    return {
        "type": "ordinalScope",
        "scopeType": scope_type,
        "start": start,
        "length": length,
    }
