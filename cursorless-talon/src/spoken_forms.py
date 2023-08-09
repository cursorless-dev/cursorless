import json
from pathlib import Path
from typing import Callable, Concatenate, ParamSpec, TypeVar

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


P = ParamSpec("P")
R = TypeVar("R")


def get_defaults_from_file(
    f: Callable[Concatenate[str, dict[str, dict[str, str]], P], R],
) -> Callable[Concatenate[str, P], R]:
    with open(JSON_FILE) as file:
        spoken_forms = json.load(file)

    def wrapper(filename: str, *args: P.args, **kwargs: P.kwargs) -> R:
        default_values = spoken_forms[filename]
        return f(filename, default_values, *args, **kwargs)

    return wrapper


def update():
    global disposables

    for disposable in disposables:
        disposable()

    watch_csv = get_defaults_from_file(init_csv_and_watch_changes)

    disposables = [
        watch_csv("actions.csv"),
        watch_csv("target_connectives.csv"),
        watch_csv("modifiers.csv"),
        watch_csv("positions.csv"),
        watch_csv("paired_delimiters.csv"),
        watch_csv("special_marks.csv"),
        watch_csv("scope_visualizer.csv"),
        watch_csv("experimental/experimental_actions.csv"),
        watch_csv("experimental/miscellaneous.csv"),
        watch_csv(
            "modifier_scope_types.csv",
            pluralize_lists=["scope_type"],
        ),
        watch_csv(
            "experimental/wrapper_snippets.csv",
            allow_unknown_values=True,
            default_list_name="wrapper_snippet",
        ),
        watch_csv(
            "experimental/insertion_snippets.csv",
            allow_unknown_values=True,
            default_list_name="insertion_snippet_no_phrase",
        ),
        watch_csv(
            "experimental/insertion_snippets_single_phrase.csv",
            allow_unknown_values=True,
            default_list_name="insertion_snippet_single_phrase",
        ),
        watch_csv(
            "experimental/actions_custom.csv",
            headers=[SPOKEN_FORM_HEADER, "VSCode command"],
            allow_unknown_values=True,
            default_list_name="custom_action",
        ),
        watch_csv(
            "experimental/regex_scope_types.csv",
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
