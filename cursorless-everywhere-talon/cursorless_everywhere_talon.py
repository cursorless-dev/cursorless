from typing import Any, TypedDict

from talon import Context, Module, actions


class SelectionOffsets(TypedDict):
    anchor: int
    active: int


class EditorState(TypedDict):
    text: str
    selections: list[SelectionOffsets]


class EditorChange(TypedDict):
    text: str
    rangeOffset: int
    rangeLength: int


class EditorEdit(TypedDict):
    # The new document content after the edit
    text: str

    # A list of changes that were made to the document. If you can not handle
    # this, you can ignore it and just replace the entire document with the
    # value of the `text` field above.
    changes: list[EditorChange]


mod = Module()

mod.tag("cursorless_everywhere_talon", desc="Enable cursorless everywhere in Talon")


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

    def private_cursorless_talonjs_get_response() -> Any:
        """Returns the response from the last Cursorless command"""

ctx = Context()

@ctx.action_class("user")
class Actions:
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
        # TODO: convert to Python object
        return actions.user.private_cursorless_talonjs_get_response()
