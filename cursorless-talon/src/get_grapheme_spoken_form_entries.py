import re
import typing
from collections import defaultdict
from typing import Iterator, Mapping
from uu import Error

from talon import app, registry

from .spoken_forms_output import SpokenFormOutputEntry

grapheme_capture_name = "user.any_alphanumeric_key"


def get_grapheme_spoken_form_entries() -> list[SpokenFormOutputEntry]:
    return [
        {
            "type": "grapheme",
            "id": id,
            "spokenForms": spoken_forms,
        }
        for symbol_list in generate_lists_from_capture(grapheme_capture_name)
        for id, spoken_forms in get_id_to_spoken_form_map(symbol_list).items()
    ]


def generate_lists_from_capture(capture_name) -> Iterator[str]:
    """
    Given the name of a capture, yield the names of each list that the capture
    expands to. Note that we are somewhat strict about the format of the
    capture rule, and will not handle all possible cases.
    """
    if capture_name.startswith("self."):
        capture_name = "user." + capture_name[5:]
    try:
        rule = registry.captures[capture_name][0].rule.rule
    except Error:
        app.notify("Error constructing spoken forms for graphemes")
        print(f"Error getting rule for capture {capture_name}")
        return
    rule = rule.strip()
    if rule.startswith("(") and rule.endswith(")"):
        rule = rule[1:-1]
        rule = rule.strip()
    components = re.split(r"\s*\|\s*", rule)
    for component in components:
        if component.startswith("<") and component.endswith(">"):
            yield from generate_lists_from_capture(component[1:-1])
        elif component.startswith("{") and component.endswith("}"):
            component = component[1:-1]
            if component.startswith("self."):
                component = "user." + component[5:]
            yield component
        else:
            app.notify("Error constructing spoken forms for graphemes")
            print(
                f"Unexpected component {component} while processing rule {rule} for capture {capture_name}"
            )


def get_id_to_spoken_form_map(list_name: str) -> Mapping[str, list[str]]:
    """
    Given the name of a Talon list, return a mapping from the values in that
    list to the list of spoken forms that map to the given value.
    """
    try:
        raw_list = typing.cast(dict[str, str], registry.lists[list_name][0]).copy()
    except Error:
        app.notify(f"Error getting list {list_name}")
        return {}

    inverted_list: defaultdict[str, list[str]] = defaultdict(list)
    for key, value in raw_list.items():
        inverted_list[value].append(key)

    return inverted_list
