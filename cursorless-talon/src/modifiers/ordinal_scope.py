from typing import Any

from talon import Module

from ..targets.range_target import RangeConnective

mod = Module()

mod.list("cursorless_first_modifier", desc="Cursorless first modifiers")
mod.list("cursorless_last_modifier", desc="Cursorless last modifiers")


@mod.capture(
    rule="<user.ordinals_small> | [<user.ordinals_small>] {user.cursorless_last_modifier}"
)
def cursorless_ordinal_or_last(m) -> int:
    """An ordinal or the word 'last'"""
    if m[-1] == "last":
        return -getattr(m, "ordinals_small", 1)
    return m.ordinals_small - 1


@mod.capture(
    rule="<user.cursorless_ordinal_or_last> [<user.cursorless_range_connective> <user.cursorless_ordinal_or_last>] <user.cursorless_scope_type>"
)
def cursorless_ordinal_range(m) -> dict[str, Any]:
    """Ordinal range"""
    anchor = create_ordinal_scope_modifier(
        m.cursorless_scope_type, m.cursorless_ordinal_or_last_list[0]
    )
    if len(m.cursorless_ordinal_or_last_list) > 1:
        active = create_ordinal_scope_modifier(
            m.cursorless_scope_type, m.cursorless_ordinal_or_last_list[1]
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
    rule=(
        "[{user.cursorless_every_scope_modifier}] "
        "({user.cursorless_first_modifier} | {user.cursorless_last_modifier}) "
        "<number_small> <user.cursorless_scope_type_plural>"
    ),
)
def cursorless_first_last(m) -> dict[str, Any]:
    """First/last `n` scopes; eg "first three funks"""
    is_every = hasattr(m, "cursorless_every_scope_modifier")
    if hasattr(m, "cursorless_first_modifier"):
        return create_ordinal_scope_modifier(
            m.cursorless_scope_type_plural,
            0,
            m.number_small,
            is_every,
        )
    return create_ordinal_scope_modifier(
        m.cursorless_scope_type_plural,
        -m.number_small,
        m.number_small,
        is_every,
    )


@mod.capture(rule="<user.cursorless_ordinal_range> | <user.cursorless_first_last>")
def cursorless_ordinal_scope(m) -> dict[str, Any]:
    """Ordinal ranges such as subwords or characters"""
    return m[0]


def create_ordinal_scope_modifier(
    scope_type: dict,
    start: int,
    length: int = 1,
    is_every: bool = False,
):
    res = {
        "type": "ordinalScope",
        "scopeType": scope_type,
        "start": start,
        "length": length,
    }
    if is_every:
        res["isEvery"] = True
    return res
