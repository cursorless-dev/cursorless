import csv
from collections import defaultdict
from collections.abc import Container
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable, Iterable, Optional, TypedDict

from talon import Context, Module, actions, app, fs, settings

from .conventions import get_cursorless_list_name
from .vendor.inflection import pluralize

SPOKEN_FORM_HEADER = "Spoken form"
CURSORLESS_IDENTIFIER_HEADER = "Cursorless identifier"


mod = Module()
mod.tag(
    "cursorless_default_vocabulary",
    desc="Use default cursorless vocabulary instead of user custom",
)
mod.setting(
    "cursorless_settings_directory",
    type=str,
    default="cursorless-settings",
    desc="The directory to use for cursorless settings csvs relative to talon user directory",
)

# The global context we use for our lists
ctx = Context()

# A context that contains default vocabulary, for use in testing
normalized_ctx = Context()
normalized_ctx.matches = r"""
tag: user.cursorless_default_vocabulary
"""


# Maps from Talon list name to a map from spoken form to value
ListToSpokenForms = dict[str, dict[str, str]]


@dataclass
class SpokenFormEntry:
    list_name: str
    id: str
    spoken_forms: list[str]


def init_csv_and_watch_changes(
    filename: str,
    default_values: ListToSpokenForms,
    handle_new_values: Optional[Callable[[list[SpokenFormEntry]], None]] = None,
    *,
    extra_ignored_values: Optional[list[str]] = None,
    extra_allowed_values: Optional[list[str]] = None,
    allow_unknown_values: bool = False,
    default_list_name: Optional[str] = None,
    headers: list[str] = [SPOKEN_FORM_HEADER, CURSORLESS_IDENTIFIER_HEADER],
    no_update_file: bool = False,
    pluralize_lists: Optional[list[str]] = None,
):
    """
    Initialize a cursorless settings csv, creating it if necessary, and watch
    for changes to the csv.  Talon lists will be generated based on the keys of
    `default_values`.  For example, if there is a key `foo`, there will be a
    list created called `user.cursorless_foo` that will contain entries from the
    original dict at the key `foo`, updated according to customization in the
    csv at

    ```
    actions.path.talon_user() / "cursorless-settings" / filename
    ```

    Note that the settings directory location can be customized using the
    `user.cursorless_settings_directory` setting.

    Args:
        filename (str): The name of the csv file to be placed in
            `cursorles-settings` dir
        default_values (ListToSpokenForms): The default values for the lists to
            be customized in the given csv
        handle_new_values (Optional[Callable[[list[SpokenFormEntry]], None]]): A
            callback to be called when the lists are updated
        extra_ignored_values (Optional[list[str]]): Don't throw an exception if
            any of these appear as values; just ignore them and don't add them
            to any list
        allow_unknown_values (bool): If unknown values appear, just put them in
            the list
        default_list_name (Optional[str]): If unknown values are
            allowed, put any unknown values in this list
        headers (list[str]): The headers to use for the csv
        no_update_file (bool): Set this to `True` to indicate that we should not
            update the csv. This is used generally in case there was an issue
            coming up with the default set of values so we don't want to persist
            those to disk
        pluralize_lists (list[str]): Create plural version of given lists
    """
    # Don't allow both `extra_allowed_values` and `allow_unknown_values`
    assert not (extra_allowed_values and allow_unknown_values)

    # If `extra_allowed_values` or `allow_unknown_values` is given, we need a
    # `default_list_name` to put unknown values in
    assert not (
        (extra_allowed_values or allow_unknown_values) and not default_list_name
    )

    if extra_ignored_values is None:
        extra_ignored_values = []
    if extra_allowed_values is None:
        extra_allowed_values = []
    if pluralize_lists is None:
        pluralize_lists = []

    file_path = get_full_path(filename)
    super_default_values = get_super_values(default_values)

    file_path.parent.mkdir(parents=True, exist_ok=True)

    check_for_duplicates(filename, default_values)
    create_default_vocabulary_dicts(default_values, pluralize_lists)

    def on_watch(path, flags):
        if file_path.match(path):
            current_values, has_errors = read_file(
                path=file_path,
                headers=headers,
                default_identifiers=super_default_values.values(),
                extra_ignored_values=extra_ignored_values,
                extra_allowed_values=extra_allowed_values,
                allow_unknown_values=allow_unknown_values,
            )
            update_dicts(
                default_values=default_values,
                current_values=current_values,
                extra_ignored_values=extra_ignored_values,
                extra_allowed_values=extra_allowed_values,
                allow_unknown_values=allow_unknown_values,
                default_list_name=default_list_name,
                pluralize_lists=pluralize_lists,
                handle_new_values=handle_new_values,
            )

    fs.watch(str(file_path.parent), on_watch)

    if file_path.is_file():
        current_values = update_file(
            path=file_path,
            headers=headers,
            default_values=super_default_values,
            extra_ignored_values=extra_ignored_values,
            extra_allowed_values=extra_allowed_values,
            allow_unknown_values=allow_unknown_values,
            no_update_file=no_update_file,
        )
        update_dicts(
            default_values=default_values,
            current_values=current_values,
            extra_ignored_values=extra_ignored_values,
            extra_allowed_values=extra_allowed_values,
            allow_unknown_values=allow_unknown_values,
            default_list_name=default_list_name,
            pluralize_lists=pluralize_lists,
            handle_new_values=handle_new_values,
        )
    else:
        if not no_update_file:
            create_file(file_path, headers, super_default_values)
        update_dicts(
            default_values=default_values,
            current_values=super_default_values,
            extra_ignored_values=extra_ignored_values,
            extra_allowed_values=extra_allowed_values,
            allow_unknown_values=allow_unknown_values,
            default_list_name=default_list_name,
            pluralize_lists=pluralize_lists,
            handle_new_values=handle_new_values,
        )

    def unsubscribe():
        fs.unwatch(str(file_path.parent), on_watch)

    return unsubscribe


def check_for_duplicates(filename, default_values):
    results_map = {}
    for list_name, dict in default_values.items():
        for key, value in dict.items():
            if value in results_map:
                existing_list_name = results_map[value]["list"]
                warning = f"WARNING ({filename}): Value `{value}` duplicated between lists '{existing_list_name}' and '{list_name}'"
                print(warning)
                app.notify(warning)


def is_removed(value: str):
    return value.startswith("-")


def create_default_vocabulary_dicts(
    default_values: dict[str, dict], pluralize_lists: list[str]
):
    default_values_updated = {}
    for key, value in default_values.items():
        updated_dict = {}
        for key2, value2 in value.items():
            # Enable deactivated(prefixed with a `-`) items
            active_key = key2[1:] if key2.startswith("-") else key2
            if active_key:
                updated_dict[active_key] = value2
        default_values_updated[key] = updated_dict
    assign_lists_to_context(normalized_ctx, default_values_updated, pluralize_lists)


def update_dicts(
    default_values: ListToSpokenForms,
    current_values: dict[str, str],
    extra_ignored_values: list[str],
    extra_allowed_values: list[str],
    allow_unknown_values: bool,
    default_list_name: Optional[str],
    pluralize_lists: list[str],
    handle_new_values: Optional[Callable[[list[SpokenFormEntry]], None]],
):
    # Create map with all default values
    results_map: dict[str, ResultsListEntry] = {}
    for list_name, obj in default_values.items():
        for spoken, id in obj.items():
            results_map[id] = {"spoken": spoken, "id": id, "list": list_name}

    # Update result with current values
    for spoken, id in current_values.items():
        try:
            results_map[id]["spoken"] = spoken
        except KeyError:
            if id in extra_ignored_values:
                pass
            elif allow_unknown_values or id in extra_allowed_values:
                assert default_list_name is not None
                results_map[id] = {
                    "spoken": spoken,
                    "id": id,
                    "list": default_list_name,
                }
            else:
                raise

    spoken_form_entries = list(generate_spoken_forms(results_map.values()))

    # Assign result to talon context list
    lists: ListToSpokenForms = defaultdict(dict)
    for entry in spoken_form_entries:
        for spoken_form in entry.spoken_forms:
            lists[entry.list_name][spoken_form] = entry.id
    assign_lists_to_context(ctx, lists, pluralize_lists)

    if handle_new_values is not None:
        handle_new_values(spoken_form_entries)


class ResultsListEntry(TypedDict):
    spoken: str
    id: str
    list: str


def generate_spoken_forms(results_list: Iterable[ResultsListEntry]):
    for obj in results_list:
        id = obj["id"]
        spoken = obj["spoken"]

        spoken_forms = []
        if not is_removed(spoken):
            for k in spoken.split("|"):
                if id == "pasteFromClipboard" and k.endswith(" to"):
                    # FIXME: This is a hack to work around the fact that the
                    # spoken form of the `pasteFromClipboard` action used to be
                    # "paste to", but now the spoken form is just "paste" and
                    # the "to" is part of the positional target. Users who had
                    # cursorless before this change would have "paste to" as
                    # their spoken form and so would need to say "paste to to".
                    k = k[:-3]
                spoken_forms.append(k.strip())

        yield SpokenFormEntry(
            list_name=obj["list"],
            id=id,
            spoken_forms=spoken_forms,
        )


def assign_lists_to_context(
    ctx: Context,
    lists: ListToSpokenForms,
    pluralize_lists: list[str],
):
    for list_name, dict in lists.items():
        list_singular_name = get_cursorless_list_name(list_name)
        ctx.lists[list_singular_name] = dict
        if list_name in pluralize_lists:
            list_plural_name = f"{list_singular_name}_plural"
            ctx.lists[list_plural_name] = {pluralize(k): v for k, v in dict.items()}


def update_file(
    path: Path,
    headers: list[str],
    default_values: dict[str, str],
    extra_ignored_values: list[str],
    extra_allowed_values: list[str],
    allow_unknown_values: bool,
    no_update_file: bool,
):
    current_values, has_errors = read_file(
        path=path,
        headers=headers,
        default_identifiers=default_values.values(),
        extra_ignored_values=extra_ignored_values,
        extra_allowed_values=extra_allowed_values,
        allow_unknown_values=allow_unknown_values,
    )
    current_identifiers = current_values.values()

    missing = {}
    for key, value in default_values.items():
        if value not in current_identifiers:
            missing[key] = value

    if missing:
        if has_errors or no_update_file:
            print(
                "NOTICE: New cursorless features detected, but refusing to update "
                "csv due to errors.  Please fix csv errors above and restart talon"
            )
        else:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            lines = [
                f"# {timestamp} - New entries automatically added by cursorless",
                *[create_line(key, missing[key]) for key in sorted(missing)],
            ]
            with open(path, "a") as f:
                f.write("\n\n" + "\n".join(lines))

            print(f"New cursorless features added to {path.name}")
            for key in sorted(missing):
                print(f"{key}: {missing[key]}")
            print(
                "See release notes for more info: "
                "https://github.com/cursorless-dev/cursorless/blob/main/CHANGELOG.md"
            )
            app.notify("🎉🎉 New cursorless features; see log")

    return current_values


def create_line(*cells: str):
    return ", ".join(cells)


def create_file(path: Path, headers: list[str], default_values: dict):
    lines = [create_line(key, default_values[key]) for key in sorted(default_values)]
    lines.insert(0, create_line(*headers))
    lines.append("")
    path.write_text("\n".join(lines))


def csv_error(path: Path, index: int, message: str, value: str):
    """Check that an expected condition is true

    Note that we try to continue reading in this case so cursorless doesn't get bricked

    Args:
        path (Path): The path of the CSV (for error reporting)
        index (int): The index into the file (for error reporting)
        text (str): The text of the error message to report if condition is false
    """
    print(f"ERROR: {path}:{index+1}: {message} '{value}'")


def read_file(
    path: Path,
    headers: list[str],
    default_identifiers: Container[str],
    extra_ignored_values: list[str],
    extra_allowed_values: list[str],
    allow_unknown_values: bool,
):
    with open(path) as csv_file:
        # Use `skipinitialspace` to allow spaces before quote. `, "a,b"`
        csv_reader = csv.reader(csv_file, skipinitialspace=True)
        rows = list(csv_reader)

    result = {}
    used_identifiers = []
    has_errors = False
    seen_headers = False

    for i, row in enumerate(rows):
        # Remove trailing whitespaces for each cell
        row = [x.rstrip() for x in row]
        # Exclude empty or comment rows
        if len(row) == 0 or (len(row) == 1 and row[0] == "") or row[0].startswith("#"):
            continue

        if not seen_headers:
            seen_headers = True
            if row != headers:
                has_errors = True
                csv_error(path, i, "Malformed header", create_line(*row))
                print(f"Expected '{create_line(*headers)}'")
            continue

        if len(row) != len(headers):
            has_errors = True
            csv_error(
                path,
                i,
                f"Malformed csv entry. Expected {len(headers)} columns.",
                create_line(*row),
            )
            continue

        key, value = row

        if (
            value not in default_identifiers
            and value not in extra_ignored_values
            and value not in extra_allowed_values
            and not allow_unknown_values
        ):
            has_errors = True
            csv_error(path, i, "Unknown identifier", value)
            continue

        if value in used_identifiers:
            has_errors = True
            csv_error(path, i, "Duplicate identifier", value)
            continue

        result[key] = value
        used_identifiers.append(value)

    if has_errors:
        app.notify("Cursorless settings error; see log")

    return result, has_errors


def get_full_path(filename: str):
    if not filename.endswith(".csv"):
        filename = f"{filename}.csv"

    user_dir: Path = actions.path.talon_user()
    settings_directory = Path(settings.get("user.cursorless_settings_directory"))

    if not settings_directory.is_absolute():
        settings_directory = user_dir / settings_directory

    return (settings_directory / filename).resolve()


def get_super_values(values: ListToSpokenForms):
    result: dict[str, str] = {}
    for value_dict in values.values():
        result.update(value_dict)
    return result
