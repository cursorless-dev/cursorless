from collections.abc import Callable
from dataclasses import dataclass
from typing import Any, Optional

from talon import Context, Module

mod = Module()
ctx = Context()

mod.list("cursorless_line_direction", desc="Supported directions for line modifier")


@dataclass
class CustomizableTerm:
    defaultSpokenForm: str
    cursorlessIdentifier: str
    type: str
    formatter: Callable


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
directions = [
    CustomizableTerm(
        "row", "lineNumberModulo100", "modulo100", lambda number: number - 1
    ),
    CustomizableTerm("up", "lineNumberRelativeUp", "relative", lambda number: -number),
    CustomizableTerm(
        "down", "lineNumberRelativeDown", "relative", lambda number: number
    ),
]

directions_map = {d.cursorlessIdentifier: d for d in directions}
DEFAULT_DIRECTIONS = {d.defaultSpokenForm: d.cursorlessIdentifier for d in directions}


@dataclass
class LineNumberRange:
    anchor: int
    range_connective_with_type: Optional[dict[str, Any]] = None
    active: Optional[int] = None


@mod.capture(
    rule=(
        "<number_small> [<user.cursorless_range_connective_with_type> <number_small>]"
    )
)
def cursorless_line_number_range(m) -> LineNumberRange:
    if len(m.number_small_list) == 1:
        return LineNumberRange(anchor=m.number_small)
    return LineNumberRange(
        anchor=m.number_small_1,
        range_connective_with_type=m.cursorless_range_connective_with_type,
        active=m.number_small_2,
    )


def create_line_number_target(
    direction: CustomizableTerm, range: LineNumberRange
) -> dict[str, Any]:
    anchor = {
        "lineNumber": direction.formatter(range.anchor),
        "type": direction.type,
    }
    if range.range_connective_with_type:
        range_connective_with_type = range.range_connective_with_type
        exclude_anchor = range_connective_with_type["excludeAnchor"]
        exclude_active = range_connective_with_type["excludeActive"]
        range_type = range_connective_with_type["type"] or "continuous"
        active = {
            "lineNumber": direction.formatter(range.active),
            "type": direction.type,
        }
    else:
        active = anchor
        range_type = "continuous"
        exclude_anchor = False
        exclude_active = False
    return {
        "rangeType": range_type,
        "anchor": anchor,
        "active": active,
        "excludeAnchor": exclude_anchor,
        "excludeActive": exclude_active,
    }


@mod.capture(
    rule=(
        "{user.cursorless_line_direction} <user.cursorless_line_number_range> "
        "({user.cursorless_list_connective} <user.cursorless_line_number_range>)*"
    )
)
def cursorless_line_number(m) -> dict[str, Any]:
    direction = directions_map[m.cursorless_line_direction]
    targets = [
        create_line_number_target(direction, range)
        for range in m.cursorless_line_number_range_list
    ]
    return {"type": "lineNumber", "elements": targets}
