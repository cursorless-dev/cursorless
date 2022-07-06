import re

from talon import registry

from ..conventions import get_cursorless_list_name


def get_list(name, descriptions=None):
    if descriptions is None:
        descriptions = {}

    items = get_raw_list(name)
    item_dict = items if isinstance(items, dict) else {item: item for item in items}

    return make_dict_readable(name, item_dict, descriptions)


def get_lists(names: list[str], descriptions=None):

    return [item for name in names for item in get_list(name, descriptions)]


def get_raw_list(name):
    cursorless_list_name = get_cursorless_list_name(name)
    return registry.lists[cursorless_list_name][0].copy()


def make_dict_readable(type: str, dict, descriptions=None):
    if descriptions is None:
        descriptions = {}

    return [
        {
            "identifier": value,
            "type": type,
            "spokenForms": [
                {
                    "spokenForm": key,
                    "description": descriptions.get(value, make_readable(value)),
                }
            ],
        }
        for key, value in dict.items()
    ]


def make_readable(text):
    text = text.replace(".", " ")
    return de_camel(text).lower().capitalize()


def de_camel(text: str) -> str:
    """Replacing camelCase boundaries with blank space"""
    return re.sub(
        r"(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|(?<=[a-zA-Z])(?=[0-9])|(?<=[0-9])(?=[a-zA-Z])",
        " ",
        text,
    )
