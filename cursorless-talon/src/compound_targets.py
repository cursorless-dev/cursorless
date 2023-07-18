from typing import Any

from talon import Module

from .connective import default_range_connective
from .primitive_target import create_implicit_target

mod = Module()

mod.list(
    "cursorless_range_connective",
    desc="A range joiner that indicates whether to include or exclude anchor and active",
)
mod.list(
    "cursorless_list_connective",
    desc="A list joiner",
)


@mod.capture(
    rule="[<user.cursorless_range_type>] {user.cursorless_range_connective} | <user.cursorless_range_type>"
)
def cursorless_range_connective_with_type(m) -> dict[str, Any]:
    return {
        "connective": getattr(
            m, "cursorless_range_connective", default_range_connective
        ),
        "type": getattr(m, "cursorless_range_type", None),
    }


@mod.capture(
    rule=(
        "<user.cursorless_primitive_target> | "
        "<user.cursorless_range_connective_with_type> <user.cursorless_primitive_target> | "
        "<user.cursorless_primitive_target> <user.cursorless_range_connective_with_type> <user.cursorless_primitive_target>"
    )
)
def cursorless_range(m) -> dict[str, Any]:
    primitive_targets = m.cursorless_primitive_target_list
    range_connective_with_type = getattr(
        m, "cursorless_range_connective_with_type", None
    )

    if range_connective_with_type is None:
        return primitive_targets[0]

    if len(primitive_targets) == 1:
        anchor = create_implicit_target()
    else:
        anchor = primitive_targets[0]

    range_connective = range_connective_with_type["connective"]
    range_type = range_connective_with_type["type"]

    range = {
        "type": "range",
        "anchor": anchor,
        "active": primitive_targets[-1],
        "excludeAnchor": not is_anchor_included(range_connective),
        "excludeActive": not is_active_included(range_connective),
    }

    if range_type:
        range["rangeType"] = range_type

    return range


def is_anchor_included(range_connective: str):
    return range_connective not in ["rangeExclusive", "rangeExcludingStart"]


def is_active_included(range_connective: str):
    return range_connective not in ["rangeExclusive", "rangeExcludingEnd"]


@mod.capture(
    rule="<user.cursorless_range> ({user.cursorless_list_connective} <user.cursorless_range>)*"
)
def cursorless_target(m) -> dict:
    if len(m.cursorless_range_list) == 1:
        return m.cursorless_range
    return {
        "type": "list",
        "elements": m.cursorless_range_list,
    }
