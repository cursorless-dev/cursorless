from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from talon import Module

from ..targets.range_target import RangeConnective

mod = Module()

mod.list("cursorless_line_direction", desc="Supported directions for line modifier")


@dataclass
class CustomizableTerm:
    cursorlessIdentifier: str
    type: str
    formatter: Callable


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
directions = [
    CustomizableTerm("lineNumberModulo100", "modulo100", lambda number: number - 1),
    CustomizableTerm("lineNumberRelativeUp", "relative", lambda number: -number),
    CustomizableTerm("lineNumberRelativeDown", "relative", lambda number: number),
]

directions_map = {d.cursorlessIdentifier: d for d in directions}


@mod.capture(
    rule=(
        "{user.cursorless_line_direction} <user.private_cursorless_number_small> "
        "[<user.cursorless_range_connective> <user.private_cursorless_number_small>]"
    )
)
def cursorless_line_number(m) -> dict[str, Any]:
    direction = directions_map[m.cursorless_line_direction]
    anchor = create_line_number_mark(
        direction.type, direction.formatter(m.private_cursorless_number_small_list[0])
    )
    if len(m.private_cursorless_number_small_list) > 1:
        active = create_line_number_mark(
            direction.type,
            direction.formatter(m.private_cursorless_number_small_list[1]),
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


def create_line_number_mark(line_number_type: str, line_number: int) -> dict[str, Any]:
    return {
        "type": "lineNumber",
        "lineNumberType": line_number_type,
        "lineNumber": line_number,
    }
