from typing import TypedDict

from talon import Module


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


class EditorChanges(TypedDict):
    text: str
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
        changes: EditorChanges,  # pyright: ignore [reportGeneralTypeIssues]
    ):
        """Edit focused element text"""
