from talon import Module, app

from .csv_overrides import init_csv_and_watch_changes

mod = Module()


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
range_connectives = {
    "between": "rangeExclusive",
    "past": "rangeInclusive",
    "-": "rangeExcludingStart",
    "until": "rangeExcludingEnd",
}


def on_ready():
    init_csv_and_watch_changes(
        "target_connectives",
        {
            "range_connective": range_connectives,
            "list_connective": {"and": "listConnective"},
            "swap_connective": {"with": "swapConnective"},
            "insertion_mode_to": {"to": "sourceDestinationConnective"},
        },
    )


app.register("ready", on_ready)
