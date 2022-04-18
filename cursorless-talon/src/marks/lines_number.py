from dataclasses import dataclass

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


@mod.capture(
    rule=(
        "{user.cursorless_line_direction} <number_small> "
        "[<user.cursorless_range_connective_with_type> <number_small>]"
    )
)
def cursorless_line_number(m) -> str:
    direction = directions_map[m.cursorless_line_direction]
    start_line = {
        "lineNumber": direction.formatter(m.number_small_1),
        "type": direction.type,
    }
    if len(m.number_small_list) == 2:
        range_connective_with_type = m.cursorless_range_connective_with_type
        range_connective = range_connective_with_type["connective"]
        range_type = range_connective_with_type["type"]
        end_line = {
            "lineNumber": direction.formatter(m.number_small_2),
            "type": direction.type,
        }
        range = {
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
            range["rangeType"] = range_type
        return range
    else:
        return {
            "selectionType": "line",
            "mark": {
                "type": "lineNumber",
                "anchor": start_line,
                "active": start_line,
            },
        }
