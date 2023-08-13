import json
from pathlib import Path
from typing import Callable, Concatenate, ParamSpec, TypeVar

from talon import app, fs

from .csv_overrides import SPOKEN_FORM_HEADER, init_csv_and_watch_changes
from .marks.decorated_mark import init_hats

JSON_FILE = Path(__file__).parent / "spoken_forms.json"
disposables: list[Callable] = []


def watch_file(spoken_forms: dict, filename: str) -> Callable:
    return init_csv_and_watch_changes(
        filename,
        spoken_forms[filename],
    )


P = ParamSpec("P")
R = TypeVar("R")


def auto_construct_defaults(
    spoken_forms: dict[str, dict[str, dict[str, str]]],
    f: Callable[Concatenate[str, dict[str, dict[str, str]], P], R],
):
    """
    Decorator that automatically constructs the default values for the
    `default_values` parameter of `f` based on the spoken forms in
    `spoken_forms`, by extracting the value at the key given by the csv
    filename.

    Note that we only ever pass `init_csv_and_watch_changes` as `f`. The
    reason we have this decorator is so that we can destructure the kwargs
    of `init_csv_and_watch_changes` to remove the `default_values` parameter.

    Args:
        spoken_forms (dict[str, dict[str, dict[str, str]]]): The spoken forms
        f (Callable[Concatenate[str, dict[str, dict[str, str]], P], R]): Will always be `init_csv_and_watch_changes`
    """

    def ret(filename: str, *args: P.args, **kwargs: P.kwargs) -> R:
        default_values = spoken_forms[filename]
        return f(filename, default_values, *args, **kwargs)

    return ret


def update():
    global disposables

    for disposable in disposables:
        disposable()

    with open(JSON_FILE) as file:
        spoken_forms = json.load(file)

    handle_csv = auto_construct_defaults(spoken_forms, init_csv_and_watch_changes)

    disposables = [
        handle_csv("actions.csv"),
        handle_csv("target_connectives.csv"),
        handle_csv("modifiers.csv"),
        handle_csv("positions.csv"),
        handle_csv("paired_delimiters.csv"),
        handle_csv("special_marks.csv"),
        handle_csv("scope_visualizer.csv"),
        handle_csv("experimental/experimental_actions.csv"),
        handle_csv("experimental/miscellaneous.csv"),
        handle_csv(
            "modifier_scope_types.csv",
            pluralize_lists=["scope_type"],
        ),
        handle_csv(
            "experimental/wrapper_snippets.csv",
            allow_unknown_values=True,
            default_list_name="wrapper_snippet",
        ),
        handle_csv(
            "experimental/insertion_snippets.csv",
            allow_unknown_values=True,
            default_list_name="insertion_snippet_no_phrase",
        ),
        handle_csv(
            "experimental/insertion_snippets_single_phrase.csv",
            allow_unknown_values=True,
            default_list_name="insertion_snippet_single_phrase",
        ),
        handle_csv(
            "experimental/actions_custom.csv",
            headers=[SPOKEN_FORM_HEADER, "VSCode command"],
            allow_unknown_values=True,
            default_list_name="custom_action",
        ),
        handle_csv(
            "experimental/regex_scope_types.csv",
            headers=[SPOKEN_FORM_HEADER, "Regex"],
            allow_unknown_values=True,
            default_list_name="custom_regex_scope_type",
            pluralize_lists=["custom_regex_scope_type"],
        ),
        init_hats(
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
