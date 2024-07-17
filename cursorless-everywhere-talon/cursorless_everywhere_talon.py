from dataclasses import dataclass
from typing import Any

from talon import Module, actions


@dataclass
class OffsetSelection:
    anchor: int
    active: int

    def to_dict(self) -> dict[str, int]:
        return {"anchor": self.anchor, "active": self.active}


@dataclass
class EditorState:
    text: str
    selections: list[OffsetSelection]

    def to_dict(self) -> dict[str, Any]:
        return {
            "text": self.text,
            "selections": [s.to_dict() for s in self.selections],
        }


mod = Module()


@mod.action_class
class Actions:
    def cursorless_everywhere_get_editor_state() -> dict[str, Any]:
        """Get the focused editor element state"""
        state = actions.user.private_cursorless_everywhere_get_editor_state()
        return state.to_dict()

    def private_cursorless_everywhere_get_editor_state() -> (
        EditorState  # pyright: ignore [reportReturnType]
    ):
        """Get the focused editor element state"""

    def cursorless_everywhere_set_selection(
        selection: dict[str, int],  # pyright: ignore [reportGeneralTypeIssues]
    ):
        """Set focused element selection"""

    def cursorless_everywhere_set_text(
        text: str,  # pyright: ignore [reportGeneralTypeIssues]
    ):
        """Set focused element text"""
