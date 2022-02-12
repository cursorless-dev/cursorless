from talon import app
from .csv_overrides import init_csv_and_watch_changes

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://github.com/cursorless-dev/cursorless-vscode/blob/main/docs/user/customization.md
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
