import csv
from collections.abc import Container, Mapping
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable, Optional

from talon import Context, Module, actions, app, fs

from .conventions import get_cursorless_list_name
from .vendor.inflection import pluralize

SPOKEN_FORM_HEADER = "Spoken form"
CURSORLESS_IDENTIFIER_HEADER = "Cursorless identifier"


mod = Module()
mod.tag(
    "cursorless_default_vocabulary",
    desc="Use default cursorless vocabulary instead of user custom",
)
cursorless_settings_directory = mod.setting(
    "cursorless_settings_directory",
    type=str,
    default="cursorless-settings",
    desc="The directory to use for cursorless settings csvs relative to talon user directory",
)

default_ctx = Context()
default_ctx.matches = r"""
tag: user.cursorless_default_vocabulary
"""


def init_csv_and_watch_changes(
    filename: str,
    default_values: Mapping[str, Mapping[str, str]],
    extra_ignored_values: Container[str] = (),
    *,
    allow_unknown_values: bool = False,
    default_list_name: Optional[str] = None,
    headers: list[str] = [SPOKEN_FORM_HEADER, CURSORLESS_IDENTIFIER_HEADER],
    ctx: Context = Context(),
    no_update_file: bool = False,
    pluralize_lists: Container[str] = (),
) -> Callable[[], None]:
    """
    Initialize a cursorless settings csv, creating it if necessary, and watch
    for changes to the csv.  Talon lists will be generated based on the keys of
    `default_values`.  For example, if there is a key `foo`, there will be a
    list created called `user.cursorless_foo` that will contain entries from
    the original dict at the key `foo`, updated according to customization in
    the csv at

        actions.path.talon_user() / "cursorless-settings" / filename

    Note that the settings directory location can be customized using the
    `user.cursorless_settings_directory` setting.

    Args:
        filename (str): The name of the csv file to be placed in
        `cursorles-settings` dir
        default_values (dict[str, dict]): The default values for the lists to
        be customized in the given csv
        extra_ignored_values: Don't throw an exception if any of
        these appear as values; just ignore them and don't add them to any list
        allow_unknown_values bool: If unknown values appear, just put them in the list
        default_list_name Optional[str]: If unknown values are allowed, put any
        unknown values in this list
        no_update_file: Set this to `TRUE` to indicate that we should
        not update the csv. This is used generally in case there was an issue coming up with the default set of values so we don't want to persist those to disk
        pluralize_lists: Create plural version of given lists
    """
    file_path = get_full_path(filename)
    super_default_values = get_super_values(default_values)
    assert allow_unknown_values == (default_list_name is not None)

    file_path.parent.mkdir(parents=True, exist_ok=True)

    check_for_duplicates(filename, default_values)
    create_default_vocabulary_dicts(default_values, pluralize_lists)

    def on_watch(path: str, flags) -> None:
        if file_path.match(path):
            current_values, has_errors = read_file(
                file_path,
                headers,
                super_default_values.values(),
                extra_ignored_values,
                allow_unknown_values,
            )
            update_dicts(
                default_values,
                current_values,
                extra_ignored_values,
                default_list_name,
                pluralize_lists,
                ctx,
            )

    fs.watch(str(file_path.parent), on_watch)

    if file_path.is_file():
        current_values = update_file(
            file_path,
            headers,
            super_default_values,
            extra_ignored_values,
            allow_unknown_values,
            no_update_file,
        )
        update_dicts(
            default_values,
            current_values,
            extra_ignored_values,
            default_list_name,
            pluralize_lists,
            ctx,
        )
    else:
        if not no_update_file:
            create_file(file_path, headers, super_default_values)
        update_dicts(
            default_values,
            super_default_values,
            extra_ignored_values,
            default_list_name,
            pluralize_lists,
            ctx,
        )

    def unsubscribe() -> None:
        fs.unwatch(str(file_path.parent), on_watch)

    return unsubscribe


@dataclass
class ListValue:
    key: str
    value: str
    #: The list name.
    list: str


def check_for_duplicates(
    filename: str, default_values: Mapping[str, Mapping[str, str]]
):
    results_map = {}
    for list_name, values in default_values.items():
        for key, value in values.items():
            if value in results_map:
                existing_list_name = results_map[value]["list"]
                warning = f"WARNING ({filename}): Value `{value}` duplicated between lists '{existing_list_name}' and '{list_name}'"
                print(warning)
                app.notify(warning)


def is_removed(value: str) -> bool:
    return value.startswith("-")


def create_default_vocabulary_dicts(
    default_values: Mapping[str, Mapping[str, str]], pluralize_lists: Container[str]
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
    assign_lists_to_context(default_ctx, default_values_updated, pluralize_lists)


def update_dicts(
    default_values: Mapping[str, Mapping[str, str]],
    current_values: dict[str, str],
    extra_ignored_values: Container[str],
    default_list_name: Optional[str],
    pluralize_lists: Container[str],
    ctx: Context,
) -> None:
    # Create map with all default values
    results_map: dict[str, ListValue] = {}
    for list_name, values in default_values.items():
        for key, value in values.items():
            results_map[value] = ListValue(key=key, value=value, list=list_name)

    # Update result with current values
    for key, value in current_values.items():
        try:
            results_map[value].key = key
        except KeyError:
            if value in extra_ignored_values:
                pass
            elif default_list_name is not None:
                results_map[value] = ListValue(
                    key=key, value=value, list=default_list_name
                )
            else:
                raise

    # Convert result map back to result list
    results: dict[str, dict[str, str]] = {res.list: {} for res in results_map.values()}
    for obj in results_map.values():
        value = obj.value
        key = obj.key
        if not is_removed(key):
            for k in key.split("|"):
                if value == "pasteFromClipboard" and k.endswith(" to"):
                    # FIXME: This is a hack to work around the fact that the
                    # spoken form of the `pasteFromClipboard` action used to be
                    # "paste to", but now the spoken form is just "paste" and
                    # the "to" is part of the positional target. Users who had
                    # cursorless before this change would have "paste to" as
                    # their spoken form and so would need to say "paste to to".
                    k = k[:-3]
                results[obj.list][k.strip()] = value

    # Assign result to talon context list
    assign_lists_to_context(ctx, results, pluralize_lists)


def assign_lists_to_context(
    ctx: Context,
    results: dict[str, dict[str, str]],
    pluralize_lists: Container[str],
):
    for list_name, values in results.items():
        list_singular_name = get_cursorless_list_name(list_name)
        ctx.lists[list_singular_name] = values
        if list_name in pluralize_lists:
            list_plural_name = f"{list_singular_name}_plural"
            ctx.lists[list_plural_name] = {pluralize(k): v for k, v in values.items()}


def update_file(
    path: Path,
    headers: list[str],
    default_values: dict[str, str],
    extra_ignored_values: Container[str],
    allow_unknown_values: bool,
    no_update_file: bool,
) -> dict[str, str]:
    current_values, has_errors = read_file(
        path,
        headers,
        default_values.values(),
        extra_ignored_values,
        allow_unknown_values,
    )
    current_identifiers = current_values.values()

    missing: dict[str, str] = {}
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
            missing_items = sorted(missing.items())
            lines = [
                f"# {timestamp} - New entries automatically added by cursorless",
                *[create_line(key, value) for key, value in missing_items],
            ]
            with open(path, "a") as f:
                f.write("\n\n" + "\n".join(lines))

            print(f"New cursorless features added to {path.name}")
            for key, value in missing_items:
                print(f"{key}: {value}")
            print(
                "See release notes for more info: "
                "https://github.com/cursorless-dev/cursorless/blob/main/CHANGELOG.md"
            )
            app.notify("🎉🎉 New cursorless features; see log")

    return current_values


def create_line(*cells: str) -> str:
    return ", ".join(cells)


def create_file(path: Path, headers: list[str], default_values: dict[str, str]) -> None:
    lines = [create_line(key, value) for key, value in sorted(default_values.items())]
    lines.insert(0, create_line(*headers))
    lines.append("")
    path.write_text("\n".join(lines))


def csv_error(path: Path, index: int, message: str, value: str) -> None:
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
    extra_ignored_values: Container[str],
    allow_unknown_values: bool,
) -> tuple[dict[str, str], bool]:
    with open(path) as csv_file:
        # Use `skipinitialspace` to allow spaces before quote. `, "a,b"`
        csv_reader = csv.reader(csv_file, skipinitialspace=True)
        rows = list(csv_reader)

    result: dict[str, str] = {}
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
            and not allow_unknown_values
        ):
            has_errors = True
            csv_error(path, i, "Unknown identifier", value)
            continue

        if value in result:
            has_errors = True
            csv_error(path, i, "Duplicate identifier", value)
            continue

        result[key] = value

    if has_errors:
        app.notify("Cursorless settings error; see log")

    return result, has_errors


def get_full_path(filename: str) -> Path:
    if not filename.endswith(".csv"):
        filename = f"{filename}.csv"

    user_dir: Path = actions.path.talon_user()
    settings_directory = Path(cursorless_settings_directory.get())

    if not settings_directory.is_absolute():
        settings_directory = user_dir / settings_directory

    return (settings_directory / filename).resolve()


def get_super_values(values: Mapping[str, Mapping[str, str]]) -> dict[str, str]:
    result: dict[str, str] = {}
    for value_dict in values.values():
        result.update(value_dict)
    return result
