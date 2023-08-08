import json
from pathlib import Path

from talon import app, fs

from .csv_overrides import SPOKEN_FORM_HEADER, init_csv_and_watch_changes
from .marks.mark import init_marks
from .paired_delimiter import paired_delimiter_spoken_form_defaults

JSON_FILE = Path(__file__).parent / "spoken_forms.json"
disposables = []


def update():
    global disposables

    for disposable in disposables:
        disposable()

    with open(JSON_FILE) as file:
        spoken_forms = json.load(file)

    disposables = [
        init_csv_and_watch_changes(
            "actions",
            spoken_forms["actions"],
        ),
        init_csv_and_watch_changes(
            "target_connectives",
            spoken_forms["targetConnectives"],
        ),
        init_csv_and_watch_changes(
            "modifiers",
            spoken_forms["modifiers"],
        ),
        init_csv_and_watch_changes(
            "positions",
            spoken_forms["positions"],
        ),
        init_csv_and_watch_changes(
            "modifier_scope_types",
            spoken_forms["scopeTypes"],
            pluralize_lists=["scope_type"],
        ),
        init_csv_and_watch_changes(
            "special_marks",
            spoken_forms["specialMarks"],
        ),
        init_csv_and_watch_changes(
            "scope_visualizer",
            spoken_forms["scopeVisualizer"],
        ),
        init_csv_and_watch_changes(
            "paired_delimiters",
            paired_delimiter_spoken_form_defaults(spoken_forms["matchingPairs"]),
        ),
        init_csv_and_watch_changes(
            "experimental/experimental_actions",
            spoken_forms["experimental.actions"],
        ),
        init_csv_and_watch_changes(
            "experimental/actions_custom",
            {},
            headers=[SPOKEN_FORM_HEADER, "VSCode command"],
            allow_unknown_values=True,
            default_list_name="custom_action",
        ),
        init_csv_and_watch_changes(
            "experimental/regex_scope_types",
            {},
            headers=[SPOKEN_FORM_HEADER, "Regex"],
            allow_unknown_values=True,
            default_list_name="custom_regex_scope_type",
            pluralize_lists=["custom_regex_scope_type"],
        ),
        init_csv_and_watch_changes(
            "experimental/wrapper_snippets",
            spoken_forms["wrapperSnippets"],
            allow_unknown_values=True,
            default_list_name="wrapper_snippet",
        ),
        init_csv_and_watch_changes(
            "experimental/insertion_snippets",
            spoken_forms["insertionSnippets"],
            allow_unknown_values=True,
            default_list_name="insertion_snippet_no_phrase",
        ),
        init_csv_and_watch_changes(
            "experimental/insertion_snippets_single_phrase",
            spoken_forms["insertionSnippetsSinglePhrase"],
            allow_unknown_values=True,
            default_list_name="insertion_snippet_single_phrase",
        ),
        init_csv_and_watch_changes(
            "experimental/miscellaneous",
            spoken_forms["experimental.miscellaneous"],
        ),
        init_marks(
            spoken_forms["hats"]["hat_color"],
            spoken_forms["hats"]["hat_shape"],
        ),
    ]


def on_watch(path, flags):
    if JSON_FILE.match(path):
        update()


def on_ready():
    update()

    fs.watch(str(JSON_FILE.parent), on_watch)


app.register("ready", on_ready)
