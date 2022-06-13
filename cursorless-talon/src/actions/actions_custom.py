from talon import Module, app

from ..csv_overrides import SPOKEN_FORM_HEADER, init_csv_and_watch_changes

custom_action_defaults = {}


mod = Module()
mod.list(
    "cursorless_custom_action",
    desc="Supported custom actions for cursorless navigation",
)


def on_ready():
    init_csv_and_watch_changes(
        "experimental/actions_custom",
        custom_action_defaults,
        headers=[SPOKEN_FORM_HEADER, "VSCode command"],
        allow_unknown_values=True,
        default_list_name="custom_action",
    )


app.register("ready", on_ready)
