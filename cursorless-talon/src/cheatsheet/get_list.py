import re

from talon import registry

from ..conventions import get_cursorless_list_name


def get_list(name, descriptions=None):
    if descriptions is None:
        descriptions = {}

    items = get_raw_list(name)
    if isinstance(items, dict):
        make_dict_readable(items, descriptions)
    return items


def get_lists(names: list[str], descriptions=None):
    items = sorted(
        item for name in names for item in get_list(name, descriptions).items()
    )
    return {key: value for key, value in items}


def get_raw_list(name):
    cursorless_list_name = get_cursorless_list_name(name)
    return registry.lists[cursorless_list_name][0].copy()


def make_dict_readable(dict, descriptions=None):
    if descriptions is None:
        descriptions = {}

    for k in dict:
        desc = dict[k]
        if desc in descriptions:
            desc = descriptions[desc]
        else:
            desc = make_readable(desc)
        dict[k] = desc


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
