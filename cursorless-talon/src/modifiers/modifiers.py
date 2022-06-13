from talon import Module, app

from ..csv_overrides import init_csv_and_watch_changes
from .range_type import range_types

mod = Module()

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
simple_modifiers = {
    "inside": "interiorOnly",
    "bounds": "excludeInterior",
    "just": "toRawSelection",
    "head": "extendThroughStartOf",
    "tail": "extendThroughEndOf",
    "leading": "leading",
    "trailing": "trailing",
}

mod.list(
    "cursorless_simple_modifier",
    desc="Simple cursorless modifiers that only need to specify their type",
)


@mod.capture(rule="{user.cursorless_simple_modifier}")
def cursorless_simple_modifier(m) -> dict[str, str]:
    """Simple cursorless modifiers that only need to specify their type"""
    return {
        "type": m.cursorless_simple_modifier,
    }


def on_ready():
    init_csv_and_watch_changes(
        "modifiers",
        {
            "simple_modifier": simple_modifiers,
            "range_type": range_types,
        },
    )


app.register("ready", on_ready)
