import re
import typing
from collections import defaultdict
from typing import Iterator, Mapping

from talon import app, registry, scope

from .spoken_forms_output import SpokenFormOutputEntry

grapheme_capture_name = "user.any_alphanumeric_key"


def get_grapheme_spoken_form_entries(
    grapheme_talon_list: dict[str, str],
) -> list[SpokenFormOutputEntry]:
    return [
        {
            "type": "grapheme",
            "id": id,
            "spokenForms": spoken_forms,
        }
        for id, spoken_forms in talon_list_to_spoken_form_map(
            grapheme_talon_list
        ).items()
    ]


def get_graphemes_talon_list() -> dict[str, str]:
    if grapheme_capture_name not in registry.captures:
        # We require this capture, and expect it to be defined. We want to show a user friendly error if it isn't present (usually indicating a problem with their community.git setup) and we think the user is going to use Cursorless.
        # However, sometimes users use different dictation engines (Vosk, Webspeech) with entirely different/smaller grammars that don't have the capture, and this code will run then, and falsely error. We don't want to show an error in that case because they don't plan to actually use Cursorless.
        if "en" in scope.get("language", {}):
            app.notify(f"Capture <{grapheme_capture_name}> isn't defined")
            print(
                f"Capture <{grapheme_capture_name}> isn't defined, which is required by Cursorless. Please check your community setup"
            )
        return {}

    return {
        spoken_form: id
        for symbol_list in generate_lists_from_capture(grapheme_capture_name)
        for spoken_form, id in get_id_to_talon_list(symbol_list).items()
    }


def generate_lists_from_capture(capture_name) -> Iterator[str]:
    """
    Given the name of a capture, yield the names of each list that the capture
    expands to. Note that we are somewhat strict about the format of the
    capture rule, and will not handle all possible cases.
    """
    if capture_name.startswith("self."):
        capture_name = "user." + capture_name[5:]
    try:
        # NB: [-1] because the last capture is the active one
        rule = registry.captures[capture_name][-1].rule.rule
    except Exception:
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


def get_id_to_talon_list(list_name: str) -> dict[str, str]:
    """
    Given the name of a Talon list, return that list
    """
    try:
        # NB: [-1] because the last list is the active one
        return typing.cast(dict[str, str], registry.lists[list_name][-1]).copy()
    except Exception:
        app.notify(f"Error getting list {list_name}")
        return {}


def talon_list_to_spoken_form_map(
    talon_list: dict[str, str],
) -> Mapping[str, list[str]]:
    """
    Given a Talon list, return a mapping from the values in that
    list to the list of spoken forms that map to the given value.
    """
    inverted_list: defaultdict[str, list[str]] = defaultdict(list)
    for key, value in talon_list.items():
        inverted_list[value].append(key)

    return inverted_list
