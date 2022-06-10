from talon import Module, app

from .csv_overrides import init_csv_and_watch_changes

mod = Module()

mod.list(
    "cursorless_source_destination_connective",
    desc="The connective used to separate source and destination targets",
)


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
range_connectives = {
    "between": "rangeExclusive",
    "past": "rangeInclusive",
    "-": "rangeExcludingStart",
    "until": "rangeExcludingEnd",
}


default_range_connective = "rangeInclusive"


def on_ready():
    init_csv_and_watch_changes(
        "target_connectives",
        {
            "range_connective": range_connectives,
            "list_connective": {"and": "listConnective"},
            "swap_connective": {"with": "swapConnective"},
            "source_destination_connective": {"to": "sourceDestinationConnective"},
        },
    )


app.register("ready", on_ready)
