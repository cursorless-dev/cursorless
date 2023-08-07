import json
from pathlib import Path

from talon import app

from .csv_overrides import SPOKEN_FORM_HEADER, init_csv_and_watch_changes
from .paired_delimiter import paired_delimiter_spoken_form_defaults

JSON_FILE = Path(__file__).parent / "spoken_forms.json"


def on_ready() -> None:
    with open(JSON_FILE) as file:
        spoken_forms = json.load(file)

    init_csv_and_watch_changes(
        "actions",
        spoken_forms["actions"],
    )
    init_csv_and_watch_changes(
        "target_connectives",
        spoken_forms["target_connectives"],
    )
    init_csv_and_watch_changes(
        "modifiers",
        spoken_forms["modifiers"],
    )
    init_csv_and_watch_changes(
        "positions",
        spoken_forms["positions"],
    )
    init_csv_and_watch_changes(
        "modifier_scope_types",
        spoken_forms["scope_types"],
        pluralize_lists=["scope_type"],
    )
    init_csv_and_watch_changes(
        "special_marks",
        spoken_forms["special_marks"],
    )
    init_csv_and_watch_changes(
        "scope_visualizer",
        spoken_forms["scope_visualizer"],
    )
    init_csv_and_watch_changes(
        "paired_delimiters",
        paired_delimiter_spoken_form_defaults(spoken_forms["matching_pairs"]),
    )
    init_csv_and_watch_changes(
        "experimental/experimental_actions",
        spoken_forms["experimental.actions"],
    )
    init_csv_and_watch_changes(
        "experimental/miscellaneous",
        spoken_forms["experimental.miscellaneous"],
    )
    init_csv_and_watch_changes(
        "experimental/actions_custom",
        {},
        headers=[SPOKEN_FORM_HEADER, "VSCode command"],
        allow_unknown_values=True,
        default_list_name="custom_action",
    )
    init_csv_and_watch_changes(
        "experimental/regex_scope_types",
        {},
        headers=[SPOKEN_FORM_HEADER, "Regex"],
        allow_unknown_values=True,
        default_list_name="custom_regex_scope_type",
        pluralize_lists=["custom_regex_scope_type"],
    )
    init_csv_and_watch_changes(
        "experimental/wrapper_snippets",
        spoken_forms["experimental.wrapper_snippets"],
        allow_unknown_values=True,
        default_list_name="wrapper_snippet",
    )
    init_csv_and_watch_changes(
        "experimental/insertion_snippets",
        spoken_forms["experimental.insertion_snippets"],
        allow_unknown_values=True,
        default_list_name="insertion_snippet_no_phrase",
    )
    init_csv_and_watch_changes(
        "experimental/insertion_snippets_single_phrase",
        spoken_forms["experimental.insertion_snippets_single_phrase"],
        allow_unknown_values=True,
        default_list_name="insertion_snippet_single_phrase",
    )

    # TODO: hats/colors


app.register("ready", on_ready)
