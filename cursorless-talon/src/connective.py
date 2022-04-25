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

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://github.com/pokey/cursorless-talon/blob/main/docs/customization.md
positional_connectives = {
    "after": "afterConnective",
    "before": "beforeConnective",
    "to": "contentConnective",
}

default_range_connective = "rangeInclusive"


def on_ready():
    init_csv_and_watch_changes(
        "target_connectives",
        {
            "range_connective": range_connectives,
            "list_connective": {"and": "listConnective"},
            "swap_connective": {"with": "swapConnective"},
            "positional_connective": positional_connectives,
        },
    )


app.register("ready", on_ready)
