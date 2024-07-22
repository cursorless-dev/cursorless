from typing import TypedDict

from talon import Module


class OffsetSelection(TypedDict):
    anchor: int
    active: int


class EditorState(TypedDict):
    text: str
    selections: list[OffsetSelection]


class EditorChange(TypedDict):
    text: str
    rangeOffset: int
    rangeLength: int


class EditorChanges(TypedDict):
    text: str
    changes: list[EditorChange]


mod = Module()


@mod.action_class
class Actions:
    def cursorless_everywhere_get_editor_state() -> EditorState:  # pyright: ignore [reportReturnType]
        """Get the focused editor element state"""

    def cursorless_everywhere_set_selections(
        selections: list[OffsetSelection],  # pyright: ignore [reportGeneralTypeIssues]
    ):
        """Set focused element selections"""

    def cursorless_everywhere_set_text(
        changes: EditorChanges,  # pyright: ignore [reportGeneralTypeIssues]
    ):
        """Set focused element text"""
