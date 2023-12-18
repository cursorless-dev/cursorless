from dataclasses import dataclass
from typing import Optional

from talon import Module

from .target_types import ImplicitTarget, PrimitiveTarget, RangeTarget, RangeTargetType

mod = Module()

mod.list(
    "cursorless_range_connective",
    desc="A range joiner that indicates whether to include or exclude anchor and active",
)


@dataclass
class RangeConnective:
    excludeAnchor: bool
    excludeActive: bool


@dataclass
class RangeConnectiveWithType:
    connective: RangeConnective
    type: Optional[RangeTargetType]


@mod.capture(rule="{user.cursorless_range_connective}")
def cursorless_range_connective(m) -> RangeConnective:
    return RangeConnective(
        m.cursorless_range_connective in ["rangeExclusive", "rangeExcludingStart"],
        m.cursorless_range_connective in ["rangeExclusive", "rangeExcludingEnd"],
    )


@mod.capture(
    rule="[<user.cursorless_range_type>] <user.cursorless_range_connective> | <user.cursorless_range_type>"
)
def cursorless_range_connective_with_type(m) -> RangeConnectiveWithType:
    return RangeConnectiveWithType(
        getattr(m, "cursorless_range_connective", RangeConnective(False, False)),
        getattr(m, "cursorless_range_type", None),
    )


@mod.capture(
    rule=(
        "[<user.cursorless_primitive_target>] <user.cursorless_range_connective_with_type> <user.cursorless_primitive_target>"
    )
)
def cursorless_range_target(m) -> RangeTarget:
    primitive_targets: list[PrimitiveTarget] = m.cursorless_primitive_target_list
    range_connective_with_type: RangeConnectiveWithType = (
        m.cursorless_range_connective_with_type
    )
    range_connective = range_connective_with_type.connective

    anchor = ImplicitTarget() if len(primitive_targets) == 1 else primitive_targets[0]

    return RangeTarget(
        anchor,
        primitive_targets[-1],
        range_connective.excludeAnchor,
        range_connective.excludeActive,
        range_connective_with_type.type,
    )
