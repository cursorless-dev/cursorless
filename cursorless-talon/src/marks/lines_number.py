from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

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


@mod.capture(rule="{user.cursorless_line_direction} <number_small>")
def cursorless_line_number(m) -> dict[str, Any]:
    direction = directions_map[m.cursorless_line_direction]
    return {
        "type": "lineNumber",
        "lineNumberType": direction.type,
        "lineNumber": direction.formatter(m.number_small),
    }
