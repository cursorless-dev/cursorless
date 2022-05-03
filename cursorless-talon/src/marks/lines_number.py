from dataclasses import dataclass
from typing import Optional

from talon import Context, Module

mod = Module()
ctx = Context()

mod.list("cursorless_line_direction", desc="Supported directions for line modifier")


@dataclass
class CustomizableTerm:
    defaultSpokenForm: str
    cursorlessIdentifier: str
    type: str
    formatter: callable


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
    start_number: int
    range_connective_with_type: Optional[dict] = None
    end_number: Optional[int] = None


@mod.capture(
    rule=(
        "<number_small> [<user.cursorless_range_connective_with_type> <number_small>]"
    )
)
def cursorless_line_number_range(m) -> LineNumberRange:
    if len(m.number_small_list) == 1:
        return LineNumberRange(start_number=m.number_small)
    return LineNumberRange(
        start_number=m.number_small_1,
        range_connective_with_type=m.cursorless_range_connective_with_type,
        end_number=m.number_small_2,
    )


def create_line_number_target(
    direction: CustomizableTerm, range: LineNumberRange
) -> dict:
    start_line = {
        "lineNumber": direction.formatter(range.start_number),
        "type": direction.type,
    }
    if range.range_connective_with_type:
        range_connective_with_type = range.range_connective_with_type
        range_connective = range_connective_with_type["connective"]
        range_type = range_connective_with_type["type"]
        end_line = {
            "lineNumber": direction.formatter(range.end_number),
            "type": direction.type,
        }
        target = {
            "type": "range",
            "start": {
                "type": "primitive",
                "selectionType": "line",
                "mark": {
                    "type": "lineNumber",
                    "anchor": start_line,
                    "active": start_line,
                },
            },
            "end": {
                "type": "primitive",
                "selectionType": "line",
                "mark": {
                    "type": "lineNumber",
                    "anchor": end_line,
                    "active": end_line,
                },
            },
            "excludeStart": (
                range_connective in ["rangeExclusive", "rangeExcludingStart"]
            ),
            "excludeEnd": range_connective in ["rangeExclusive", "rangeExcludingEnd"],
        }
        if range_type:
            target["rangeType"] = range_type
        return target
    else:
        return {
            "type": "primitive",
            "selectionType": "line",
            "mark": {
                "type": "lineNumber",
                "anchor": start_line,
                "active": start_line,
            },
        }


@mod.capture(
    rule=(
        "{user.cursorless_line_direction} <user.cursorless_line_number_range> "
        "({user.cursorless_list_connective} <user.cursorless_line_number_range>)*"
    )
)
def cursorless_line_number(m) -> dict:
    direction = directions_map[m.cursorless_line_direction]
    if len(m.cursorless_line_number_range_list) == 1:
        return create_line_number_target(direction, m.cursorless_line_number_range)
    targets = [
        create_line_number_target(direction, range)
        for range in m.cursorless_line_number_range_list
    ]
    return {"type": "list", "elements": targets}
