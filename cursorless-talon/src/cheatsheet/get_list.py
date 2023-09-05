import re
from collections.abc import Mapping, Sequence
from typing import Optional, TypedDict

from talon import registry

from ..conventions import get_cursorless_list_name


class Variation(TypedDict):
    spokenForm: str
    description: str


class ListItemDescriptor(TypedDict):
    id: str
    type: str
    variations: list[Variation]


def get_list(
    name: str, type: str, descriptions: Optional[Mapping[str, str]] = None
) -> list[ListItemDescriptor]:
    if descriptions is None:
        descriptions = {}

    items = get_raw_list(name)

    return make_dict_readable(type, items, descriptions)


def get_lists(
    names: Sequence[str], type: str, descriptions: Optional[Mapping[str, str]] = None
) -> list[ListItemDescriptor]:
    return [item for name in names for item in get_list(name, type, descriptions)]


def get_raw_list(name: str) -> Mapping[str, str]:
    cursorless_list_name = get_cursorless_list_name(name)
    return registry.lists[cursorless_list_name][0].copy()


def make_dict_readable(
    type: str, dict: Mapping[str, str], descriptions: Mapping[str, str]
) -> list[ListItemDescriptor]:
    return [
        {
            "id": value,
            "type": type,
            "variations": [
                {
                    "spokenForm": key,
                    "description": descriptions.get(value, make_readable(value)),
                }
            ],
        }
        for key, value in dict.items()
    ]


def make_readable(text: str) -> str:
    text = text.replace(".", " ")
    return de_camel(text).lower().capitalize()


def de_camel(text: str) -> str:
    """Replacing camelCase boundaries with blank space"""
    return re.sub(
        r"(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|(?<=[a-zA-Z])(?=[0-9])|(?<=[0-9])(?=[a-zA-Z])",
        " ",
        text,
    )
