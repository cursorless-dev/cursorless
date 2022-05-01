from dataclasses import dataclass

from talon import Module

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
# See https://www.cursorless.org/docs/user/customization/

range_type_list = [
    RangeType("slice", "verticalRange", "vertical"),
]

range_type_map = {t.cursorlessIdentifier: t.type for t in range_type_list}
range_types = {t.defaultSpokenForm: t.cursorlessIdentifier for t in range_type_list}


@mod.capture(rule="{user.cursorless_range_type}")
def cursorless_range_type(m) -> str:
    """Range type modifier"""
    return range_type_map[m.cursorless_range_type]
