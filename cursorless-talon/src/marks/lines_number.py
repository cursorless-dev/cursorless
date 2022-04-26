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


@mod.capture(rule="{user.cursorless_line_direction} <number_small>")
def cursorless_line_number(m) -> str:
    direction = directions_map[m.cursorless_line_direction]
    line_number = m.number_small
    line = {
        "lineNumber": direction.formatter(line_number),
        "type": direction.type,
    }
    return {
        "selectionType": "line",
        "mark": {
            "type": "lineNumber",
            "anchor": line,
            "active": line,
        },
    }
