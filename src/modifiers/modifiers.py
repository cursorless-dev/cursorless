from talon import app

from ..csv_overrides import init_csv_and_watch_changes
from .head_tail import head_tail
from .range_type import range_types

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/

delimiter_inclusions = {
    "inside": "interiorOnly",
    "bound": "excludeInterior",
}
to_raw_selection = {"just": "toRawSelection"}


def on_ready():
    init_csv_and_watch_changes(
        "modifiers",
        {
            "delimiter_inclusion": delimiter_inclusions,
            "range_type": range_types,
            "head_tail": head_tail,
            "to_raw_selection": to_raw_selection,
        },
    )


app.register("ready", on_ready)
