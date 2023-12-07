from talon import registry

from .actions.actions import ACTION_LIST_NAMES
from .conventions import get_cursorless_list_name


def make_cursorless_list_reverse_look_up(*raw_list_names: str):
    return make_list_reverse_look_up(
        *[get_cursorless_list_name(raw_list_name) for raw_list_name in raw_list_names]
    )


def make_list_reverse_look_up(*list_names: str):
    """
    Given a list of talon list names, returns a function that does a reverse
    look-up in all lists to find the spoken form for its input.
    """

    def return_func(argument: str):
        for list_name in list_names:
            for spoken_form, value in registry.lists[list_name][-1].items():
                if value == argument:
                    return list_name, spoken_form

        raise LookupError(f"Unknown identifier `{argument}`")

    return return_func


lookup_action = make_cursorless_list_reverse_look_up(*ACTION_LIST_NAMES)
