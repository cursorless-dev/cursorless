from typing import Callable

from talon import registry

from .actions.actions import ACTION_LIST_NAMES
from .conventions import get_cursorless_list_name
from .modifiers.containing_scope import SCOPE_LIST_NAMES


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
lookup_scope_type = make_cursorless_list_reverse_look_up(*SCOPE_LIST_NAMES)


def cursorless_command_to_spoken_form(command: dict):
    action_list_name, action_spoken_form = lookup_action(command["action"])
    targets_spoken_form = targets_processor_map[action_list_name](command["targets"])
    return f"{action_spoken_form} {targets_spoken_form}"


def process_simple_action_targets(targets: list[dict]):
    return process_target(targets[0])


raw_targets_processor_map: dict[str, Callable[[list[dict]], str]] = {
    "simple_action": process_simple_action_targets,
    "positional_action": process_simple_action_targets,
    "callback_action": process_simple_action_targets,
    "makeshift_action": process_simple_action_targets,
    "custom_action": process_simple_action_targets,
    "swap_action": {"swap": "swapTargets"},
    "move_bring_action": {"bring": "replaceWithTarget", "move": "moveToTarget"},
    "wrap_action": {"wrap": "wrapWithPairedDelimiter", "repack": "rewrap"},
    "insert_snippet_action": {"snippet": "insertSnippet"},
    "reformat_action": {"format": "applyFormatter"},
}

targets_processor_map = {
    get_cursorless_list_name(key): value
    for key, value in raw_targets_processor_map.items()
}


def process_target(target: dict):
    if target["type"] == "primitive":
        return process_primitive_target(target)
    elif target["type"] == "range":
        return process_range_target(target)
    elif target["type"] == "list":
        return process_list_target(target)
    else:
        raise Exception(f"Unknown target type {target['type']}")


class MarkProcessor:
    field_name = "mark"

    def __init__(self):
        self.process_character = make_list_reverse_look_up(
            "user.letter",
            "user.number_key",
            "user.symbol_key",
        )

    def process_value(self, field_value: dict):
        mark_type = field_value["type"]
        if mark_type == "decoratedSymbol":
            return self.process_decorated_symbol(field_value)
        elif mark_type == "that":
            return self.process_that_mark(field_value)
        elif mark_type == "source":
            return self.process_source_mark(field_value)
        elif mark_type == "cursor":
            return self.process_cursor_mark(field_value)

    def process_decorated_symbol(self, field_value: dict):
        # TODO: Handle `symbolColor`
        return self.process_character(field_value["character"])[1]

    def process_that_mark(self, field_value: dict):
        # TODO: Handle this case properly using users custom term
        return "that"

    def process_source_mark(self, field_value: dict):
        # TODO: Handle this case properly using users custom term
        return "source"

    def process_cursor_mark(self, field_value: dict):
        # TODO: Handle this case properly using users custom term
        return "this"


field_processors = [MarkProcessor()]


def process_primitive_target(target: dict):
    field_spoken_forms = [
        field_processor.process_value(target.get(field_processor.field_name, None))
        for field_processor in field_processors
    ]

    return " ".join(
        [spoken_form for spoken_form in field_spoken_forms if spoken_form is not None]
    )
