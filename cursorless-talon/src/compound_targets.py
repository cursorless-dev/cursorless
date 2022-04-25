from talon import Module

from .connective import default_range_connective
from .primitive_target import BASE_TARGET

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
def cursorless_range_connective_with_type(m) -> str:
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
def cursorless_range(m) -> str:
    primitive_targets = m.cursorless_primitive_target_list
    range_connective_with_type = getattr(
        m, "cursorless_range_connective_with_type", None
    )

    if range_connective_with_type is None:
        return primitive_targets[0]

    if len(primitive_targets) == 1:
        start = BASE_TARGET.copy()
    else:
        start = primitive_targets[0]

    range_connective = range_connective_with_type["connective"]
    range_type = range_connective_with_type["type"]

    range = {
        "type": "range",
        "start": start,
        "end": primitive_targets[-1],
        "excludeStart": not is_anchor_included(range_connective),
        "excludeEnd": not is_active_included(range_connective),
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
    return {"type": "list", "elements": m.cursorless_range_list}
