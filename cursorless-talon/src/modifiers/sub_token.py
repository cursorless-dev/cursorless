from typing import Any

from talon import Module

from ..compound_targets import is_active_included, is_anchor_included

mod = Module()


mod.list("cursorless_subtoken_scope_type", desc="Supported subtoken scope types")


@mod.capture(rule="<user.ordinals_small> | last")
def ordinal_or_last(m) -> str:
    """An ordinal or the word 'last'"""
    if m[0] == "last":
        return -1
    return m.ordinals_small - 1


@mod.capture(
    rule="<user.ordinal_or_last> [{user.cursorless_range_connective} <user.ordinal_or_last>]"
)
def cursorless_ordinal_range(m) -> str:
    """Ordinal range"""
    try:
        range_connective = m.cursorless_range_connective
        include_anchor = is_anchor_included(range_connective)
        include_active = is_active_included(range_connective)
    except AttributeError:
        include_anchor = True
        include_active = True

    return {
        "anchor": m.ordinal_or_last_list[0],
        "active": m.ordinal_or_last_list[-1],
        "excludeAnchor": not include_anchor,
        "excludeActive": not include_active,
    }


@mod.capture(rule="(first | last) <number_small>")
def cursorless_first_last_range(m) -> str:
    """First/last range"""
    if m[0] == "first":
        return {"anchor": 0, "active": m.number_small - 1}
    return {"anchor": -m.number_small, "active": -1}


@mod.capture(
    rule=(
        "(<user.cursorless_ordinal_range> | <user.cursorless_first_last_range>) "
        "{user.cursorless_subtoken_scope_type}"
    )
)
def cursorless_subtoken_scope(m) -> dict[str, Any]:
    """Subtoken ranges such as subwords or characters"""
    try:
        range = m.cursorless_ordinal_range
    except AttributeError:
        range = m.cursorless_first_last_range
    return {
        "type": "ordinalRange",
        "scopeType": {
            "type": m.cursorless_subtoken_scope_type,
        },
        **range,
    }
