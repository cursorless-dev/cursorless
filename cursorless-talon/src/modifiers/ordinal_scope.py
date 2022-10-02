from typing import Any

from talon import Module

from ..compound_targets import is_active_included, is_anchor_included

mod = Module()


@mod.capture(rule="<user.ordinals_small> | last")
def ordinal_or_last(m) -> int:
    """An ordinal or the word 'last'"""
    if m[0] == "last":
        return -1
    return m.ordinals_small - 1


@mod.capture(
    rule="<user.ordinal_or_last> [{user.cursorless_range_connective} <user.ordinal_or_last>] <user.cursorless_scope_type>"
)
def cursorless_ordinal_range(m) -> dict[str, Any]:
    """Ordinal range"""
    if len(m.ordinal_or_last_list) > 1:
        range_connective = m.cursorless_range_connective
        include_anchor = is_anchor_included(range_connective)
        include_active = is_active_included(range_connective)
        anchor = create_ordinal_scope_modifier(
            m.cursorless_scope_type, m.ordinal_or_last_list[0]
        )
        active = create_ordinal_scope_modifier(
            m.cursorless_scope_type, m.ordinal_or_last_list[1]
        )
        return {
            "type": "range",
            "anchor": anchor,
            "active": active,
            "excludeAnchor": not include_anchor,
            "excludeActive": not include_active,
        }
    else:
        return create_ordinal_scope_modifier(
            m.cursorless_scope_type, m.ordinal_or_last_list[0]
        )


@mod.capture(rule="(first | last) <number_small> <user.cursorless_scope_type>")
def cursorless_first_last(m) -> dict[str, Any]:
    """First/last `n` scopes; eg "first three funk"""
    if m[0] == "first":
        return create_ordinal_scope_modifier(m.cursorless_scope_type, 0, m.number_small)
    return create_ordinal_scope_modifier(
        m.cursorless_scope_type, -m.number_small, m.number_small
    )


@mod.capture(rule="<user.cursorless_ordinal_range> | <user.cursorless_first_last>")
def cursorless_ordinal_scope(m) -> dict[str, Any]:
    """Ordinal ranges such as subwords or characters"""
    return m[0]


def create_ordinal_scope_modifier(scope_type: Any, start: int, length: int = 1):
    return {
        "type": "ordinalScope",
        "scopeType": scope_type,
        "start": start,
        "length": length,
    }
