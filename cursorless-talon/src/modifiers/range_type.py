from talon import Module
from dataclasses import dataclass

mod = Module()

mod.list(
    "cursorless_range_type",
    desc="A range modifier that indicates the specific type of the range",
)


@dataclass
class RangeType:
    defaultSpokenForm: str
    cursorlessIdentifier: str
    type: str


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://github.com/cursorless-dev/cursorless-vscode/blob/main/docs/user/customization.md

range_type_list = [
    RangeType("slice", "verticalRange", "vertical"),
]

range_type_map = {t.cursorlessIdentifier: t.type for t in range_type_list}
range_types = {t.defaultSpokenForm: t.cursorlessIdentifier for t in range_type_list}


@mod.capture(rule="{user.cursorless_range_type}")
def cursorless_range_type(m) -> str:
    """Range type modifier"""
    return range_type_map[m.cursorless_range_type]
