import json
from pathlib import Path
from typing import Callable

from talon import app, fs

from .csv_overrides import SPOKEN_FORM_HEADER, init_csv_and_watch_changes
from .marks.mark import init_marks

JSON_FILE = Path(__file__).parent / "spoken_forms.json"
disposables: list[Callable] = []


def watch_file(spoken_forms: dict, filename: str) -> Callable:
    return init_csv_and_watch_changes(
        filename,
        spoken_forms[filename],
    )


def update():
    global disposables

    for disposable in disposables:
        disposable()

    with open(JSON_FILE) as file:
        spoken_forms = json.load(file)

    disposables = [
        watch_file(spoken_forms, "actions.csv"),
        watch_file(spoken_forms, "target_connectives.csv"),
        watch_file(spoken_forms, "modifiers.csv"),
        watch_file(spoken_forms, "positions.csv"),
        watch_file(spoken_forms, "paired_delimiters.csv"),
        watch_file(spoken_forms, "special_marks.csv"),
        watch_file(spoken_forms, "scope_visualizer.csv"),
        watch_file(spoken_forms, "experimental/experimental_actions.csv"),
        watch_file(spoken_forms, "experimental/miscellaneous.csv"),
        init_csv_and_watch_changes(
            "modifier_scope_types.csv",
            spoken_forms["modifier_scope_types.csv"],
            pluralize_lists=["scope_type"],
        ),
        init_csv_and_watch_changes(
            "experimental/wrapper_snippets.csv",
            spoken_forms["experimental/wrapper_snippets.csv"],
            allow_unknown_values=True,
            default_list_name="wrapper_snippet",
        ),
        init_csv_and_watch_changes(
            "experimental/insertion_snippets.csv",
            spoken_forms["experimental/insertion_snippets.csv"],
            allow_unknown_values=True,
            default_list_name="insertion_snippet_no_phrase",
        ),
        init_csv_and_watch_changes(
            "experimental/insertion_snippets_single_phrase.csv",
            spoken_forms["experimental/insertion_snippets_single_phrase.csv"],
            allow_unknown_values=True,
            default_list_name="insertion_snippet_single_phrase",
        ),
        init_csv_and_watch_changes(
            "experimental/actions_custom.csv",
            {},
            headers=[SPOKEN_FORM_HEADER, "VSCode command"],
            allow_unknown_values=True,
            default_list_name="custom_action",
        ),
        init_csv_and_watch_changes(
            "experimental/regex_scope_types.csv",
            {},
            headers=[SPOKEN_FORM_HEADER, "Regex"],
            allow_unknown_values=True,
            default_list_name="custom_regex_scope_type",
            pluralize_lists=["custom_regex_scope_type"],
        ),
        init_marks(
            spoken_forms["hat_styles.csv"]["hat_color"],
            spoken_forms["hat_styles.csv"]["hat_shape"],
        ),
    ]


def on_watch(path, flags):
    if JSON_FILE.match(path):
        update()


def on_ready():
    update()

    fs.watch(str(JSON_FILE.parent), on_watch)


app.register("ready", on_ready)
