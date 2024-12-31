from talon import Context, Module, actions

from .cursorless_everywhere_types import EditorEdit, EditorState, SelectionOffsets

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
        command = {"type": "getActiveEditor"}
        return actions.user.run_rpc_command_get(RPC_COMMAND, command)

    def cursorless_everywhere_set_selections(
        selections: list[SelectionOffsets],  # pyright: ignore [reportGeneralTypeIssues]
    ):
        command = {
            "type": "setSelections",
            "selections": get_serializable_selections(selections),
        }
        actions.user.run_rpc_command_and_wait(RPC_COMMAND, command)

    def cursorless_everywhere_edit_text(
        edit: EditorEdit,  # pyright: ignore [reportGeneralTypeIssues]
    ):
        command = {"type": "setText", "text": edit["text"]}
        actions.user.run_rpc_command_and_wait(RPC_COMMAND, command)


# What is passed from cursorless everywhere js is a javascript object, which is not serializable for python.
def get_serializable_selections(selections: list[SelectionOffsets]):
    result: list[SelectionOffsets] = []
    for i in range(selections.length):  # pyright: ignore [reportAttributeAccessIssue]
        selection = selections[i]
        result.append(
            {
                "anchor": selection["anchor"],
                "active": selection["active"],
            }
        )
    return result
