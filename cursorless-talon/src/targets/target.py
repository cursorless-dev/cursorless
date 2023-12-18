from typing import Union

from talon import Module

from .target_types import ListTarget, PrimitiveTarget, RangeTarget

mod = Module()


mod.list(
    "cursorless_list_connective",
    desc="A list joiner",
)


@mod.capture(
    rule=("<user.cursorless_range_target> | <user.cursorless_primitive_target>")
)
def cursorless_primitive_or_range_target(m) -> Union[RangeTarget, PrimitiveTarget]:
    return m[0]


@mod.capture(
    rule=(
        "<user.cursorless_primitive_or_range_target> "
        "({user.cursorless_list_connective} <user.cursorless_primitive_or_range_target>)*"
    )
)
def cursorless_target(m) -> Union[ListTarget, RangeTarget, PrimitiveTarget]:
    targets = m.cursorless_primitive_or_range_target_list

    if len(targets) == 1:
        return targets[0]

    return ListTarget(targets)
