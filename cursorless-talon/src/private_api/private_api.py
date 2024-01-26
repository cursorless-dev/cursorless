from typing import Any, Optional, Union

from talon import Module, actions

from ..targets.target_types import (
    CursorlessTarget,
    ListTarget,
    PrimitiveTarget,
    RangeTarget,
)
from .extract_decorated_marks import extract_decorated_marks

mod = Module()


@mod.action_class
class MiscActions:
    def cursorless_private_extract_decorated_marks(capture: Any) -> list[dict]:
        """Cursorless private api: Extract all decorated marks from a Talon capture"""
        return extract_decorated_marks(capture)


@mod.action_class
class TargetBuilderActions:
    """Cursorless private api low-level target builder actions"""

    def cursorless_private_build_primitive_target(
        modifiers: list[dict], mark: Optional[dict]
    ) -> PrimitiveTarget:
        """Cursorless private api low-level target builder: Create a primitive target"""
        return PrimitiveTarget(mark, modifiers)

    def cursorless_private_build_list_target(
        elements: list[Union[PrimitiveTarget, RangeTarget]]
    ) -> Union[PrimitiveTarget, ListTarget]:
        """Cursorless private api low-level target builder: Create a list target"""
        if len(elements) == 1:
            return elements[0]

        return ListTarget(elements)


@mod.action_class
class TargetActions:
    def cursorless_private_target_nothing() -> PrimitiveTarget:
        """Cursorless private api: Creates the "nothing" target"""
        return PrimitiveTarget({"type": "nothing"}, [])


@mod.action_class
class ActionActions:
    def cursorless_private_action_highlight(
        target: CursorlessTarget, highlightId: Optional[str] = None
    ) -> None:
        """Cursorless private api: Highlights a target"""
        payload = {
            "name": "highlight",
            "target": target,
        }

        if highlightId is not None:
            payload["highlightId"] = highlightId

        actions.user.private_cursorless_command_and_wait(
            payload,
        )
