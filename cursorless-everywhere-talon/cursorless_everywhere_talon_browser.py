from talon import Context, Module, actions

from .cursorless_everywhere_types import (
    EditorEdit,
    EditorState,
    SelectionOffsets,
)

mod = Module()

mod.tag(
    "cursorless_everywhere_talon_browser",
    desc="Enable RPC to browser extension when using cursorless everywhere in Talon",
)

ctx = Context()
ctx.matches = r"""
tag: user.cursorless_everywhere_talon_browser
"""

RPC_COMMAND = "talonCommand"


@ctx.action_class("user")
class Actions:
    def cursorless_everywhere_get_editor_state() -> EditorState:
        command = {
            "id": "getEditorState",
        }
        res = rpc_get(command)
        if use_fallback(res):
            return actions.next()
        return res

    def cursorless_everywhere_set_selections(
        selections: list[SelectionOffsets],  # pyright: ignore [reportGeneralTypeIssues]
    ):
        command = {
            "id": "setSelections",
            "selections": [
                js_object_to_python_dict(s, ["anchor", "active"])
                for s in js_array_to_python_list(selections)
            ],
        }
        res = rpc_get(command)
        if use_fallback(res):
            actions.next(selections)

    def cursorless_everywhere_edit_text(
        edit: EditorEdit,  # pyright: ignore [reportGeneralTypeIssues]
    ):
        command = {
            "id": "editText",
            "text": edit["text"],
            "changes": [
                js_object_to_python_dict(c, ["text", "rangeOffset", "rangeLength"])
                for c in js_array_to_python_list(edit["changes"])
            ],
        }
        res = rpc_get(command)
        if use_fallback(res):
            actions.next(edit)


def rpc_get(command: dict):
    return actions.user.run_rpc_command_get(RPC_COMMAND, command)


def use_fallback(result: dict) -> bool:
    return result.get("fallback", False)


def js_array_to_python_list(array) -> list:
    result = []
    for i in range(array.length):
        result.append(array[i])
    return result


def js_object_to_python_dict(object, keys: list[str]) -> dict:
    result = {}
    for key in keys:
        result[key] = object[key]
    return result
