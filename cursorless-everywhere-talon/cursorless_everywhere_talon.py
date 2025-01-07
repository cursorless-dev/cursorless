import json
from typing import Any

from talon import Context, Module, actions

from .cursorless_everywhere_types import EditorEdit, EditorState, SelectionOffsets

mod = Module()

mod.tag("cursorless_everywhere_talon", desc="Enable cursorless everywhere in Talon")

ctx = Context()
ctx.matches = r"""
tag: user.cursorless_everywhere_talon
"""

ctx.tags = ["user.cursorless"]


@ctx.action_class("user")
class UserActions:
    def private_cursorless_run_rpc_command_and_wait(
        command_id: str,  # pyright: ignore [reportGeneralTypeIssues]
        arg1: Any = None,
        arg2: Any = None,
    ):
        actions.user.private_cursorless_talonjs_run_and_wait(command_id, arg1, arg2)

    def private_cursorless_run_rpc_command_no_wait(
        command_id: str,  # pyright: ignore [reportGeneralTypeIssues]
        arg1: Any = None,
        arg2: Any = None,
    ):
        actions.user.private_cursorless_talonjs_run_no_wait(command_id, arg1, arg2)

    def private_cursorless_run_rpc_command_get(
        command_id: str,  # pyright: ignore [reportGeneralTypeIssues]
        arg1: Any = None,
        arg2: Any = None,
    ) -> Any:
        actions.user.private_cursorless_talonjs_run_and_wait(command_id, arg1, arg2)
        return json.loads(actions.user.private_cursorless_talonjs_get_response_json())


@mod.action_class
class Actions:
    def cursorless_everywhere_get_editor_state() -> EditorState:  # pyright: ignore [reportReturnType]
        """Get the focused editor element state"""

    def cursorless_everywhere_set_selections(
        selections: list[SelectionOffsets],  # pyright: ignore [reportGeneralTypeIssues]
    ):
        """Set focused element selections"""

    def cursorless_everywhere_edit_text(
        edit: EditorEdit,  # pyright: ignore [reportGeneralTypeIssues]
    ):
        """Edit focused element text"""

    def private_cursorless_talonjs_run_and_wait(
        command_id: str,  # pyright: ignore [reportGeneralTypeIssues]
        arg1: Any = None,
        arg2: Any = None,
    ):
        """Executes a Cursorless command, waits for its completion, but does not return the response"""

    def private_cursorless_talonjs_run_no_wait(
        command_id: str,  # pyright: ignore [reportGeneralTypeIssues]
        arg1: Any = None,
        arg2: Any = None,
    ):
        """Executes a Cursorless command, but does not wait for it to finish, nor return the response"""

    def private_cursorless_talonjs_get_response_json() -> str:
        """Returns the response from the last Cursorless command"""
