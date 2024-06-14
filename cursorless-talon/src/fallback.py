from typing import Callable

from talon import actions

from .versions import COMMAND_VERSION

# This ensures that we remember to update fallback if the response payload changes
assert COMMAND_VERSION == 7

action_callbacks = {
    "getText": lambda: [actions.edit.selected_text()],
    "setSelection": actions.skip,
    "setSelectionBefore": actions.edit.left,
    "setSelectionAfter": actions.edit.right,
    "copyToClipboard": actions.edit.copy,
    "cutToClipboard": actions.edit.cut,
    "pasteFromClipboard": actions.edit.paste,
    "clearAndSetSelection": actions.edit.delete,
    "remove": actions.edit.delete,
    "editNewLineBefore": actions.edit.line_insert_up,
    "editNewLineAfter": actions.edit.line_insert_down,
}

modifier_callbacks = {
    "extendThroughStartOf.line": actions.user.select_line_start,
    "extendThroughEndOf.line": actions.user.select_line_end,
    "containingScope.document": actions.edit.select_all,
    "containingScope.paragraph": actions.edit.select_paragraph,
    "containingScope.line": actions.edit.select_line,
    "containingScope.token": actions.edit.select_word,
}


def call_as_function(callee: str):
    wrap_with_paired_delimiter(f"{callee}(", ")")


def wrap_with_paired_delimiter(left: str, right: str):
    selected = actions.edit.selected_text()
    actions.insert(f"{left}{selected}{right}")
    for _ in right:
        actions.edit.left()


def containing_token_if_empty():
    if actions.edit.selected_text() == "":
        actions.edit.select_word()


def perform_fallback(fallback: dict):
    try:
        modifier_callbacks = get_modifier_callbacks(fallback)
        action_callback = get_action_callback(fallback)
        for callback in reversed(modifier_callbacks):
            callback()
        return action_callback()
    except ValueError as ex:
        actions.app.notify(str(ex))


def get_action_callback(fallback: dict) -> Callable:
    action = fallback["action"]

    if action in action_callbacks:
        return action_callbacks[action]

    match action:
        case "insert":
            return lambda: actions.insert(fallback["text"])
        case "callAsFunction":
            return lambda: call_as_function(fallback["callee"])
        case "wrapWithPairedDelimiter":
            return lambda: wrap_with_paired_delimiter(
                fallback["left"], fallback["right"]
            )

    raise ValueError(f"Unknown Cursorless fallback action: {action}")


def get_modifier_callbacks(fallback: dict) -> list[Callable]:
    return [get_modifier_callback(modifier) for modifier in fallback["modifiers"]]


def get_modifier_callback(modifier: dict) -> Callable:
    modifier_type = modifier["type"]

    match modifier_type:
        case "containingTokenIfEmpty":
            return containing_token_if_empty
        case "containingScope":
            scope_type_type = modifier["scopeType"]["type"]
            return get_simple_modifier_callback(f"{modifier_type}.{scope_type_type}")
        case "extendThroughStartOf":
            if "modifiers" not in modifier:
                return get_simple_modifier_callback(f"{modifier_type}.line")
        case "extendThroughEndOf":
            if "modifiers" not in modifier:
                return get_simple_modifier_callback(f"{modifier_type}.line")

    raise ValueError(f"Unknown Cursorless fallback modifier: {modifier_type}")


def get_simple_modifier_callback(key: str) -> Callable:
    try:
        return modifier_callbacks[key]
    except KeyError:
        raise ValueError(f"Unknown Cursorless fallback modifier: {key}")
