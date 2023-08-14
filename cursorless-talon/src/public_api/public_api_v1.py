from typing import Any, Optional, Union

from talon import Module, actions

from ..targets.target_types import (
    CursorlessTarget,
    ListTarget,
    PrimitiveTarget,
    RangeTarget,
    RangeTargetType,
)
from .extract_decorated_marks import extract_decorated_marks

mod = Module()


@mod.action_class
class MiscActions:
    def cursorless_v1_extract_decorated_marks(capture: Any) -> list[dict]:
        """Cursorless api v1: Extract all decorated marks from a Talon capture"""
        return extract_decorated_marks(capture)


@mod.action_class
class TargetBuilderActions:
    """Cursorless api v1 low-level target builder actions"""

    def cursorless_v1_build_primitive_target(
        modifiers: list[dict], mark: Optional[dict]
    ) -> PrimitiveTarget:
        """Cursorless api v1 low-level target builder: Create a primitive target"""
        return PrimitiveTarget(mark, modifiers)

    def cursorless_v1_build_range_target(
        anchor: PrimitiveTarget,
        active: PrimitiveTarget,
        excludeAnchor: bool = False,
        excludeActive: bool = False,
        rangeType: Optional[RangeTargetType] = None,
    ) -> RangeTarget:
        """Cursorless api v1 low-level target builder: Create a range target"""
        return RangeTarget(anchor, active, excludeAnchor, excludeActive, rangeType)

    def cursorless_v1_build_list_target(
        elements: list[Union[PrimitiveTarget, RangeTarget]]
    ) -> Union[PrimitiveTarget, ListTarget]:
        """Cursorless api v1 low-level target builder: Create a list target"""
        if len(elements) == 1:
            return elements[0]

        return ListTarget(elements)


@mod.action_class
class TargetActions:
    def cursorless_v1_target_nothing() -> PrimitiveTarget:
        """Cursorless api v1: Creates the "nothing" target"""
        return PrimitiveTarget({"type": "nothing"}, [])


@mod.action_class
class ActionActions:
    def cursorless_v1_action_highlight(
        target: CursorlessTarget, highlightId: Optional[str] = None
    ) -> None:
        """Cursorless api v1: Highlights a target"""
        payload = {
            "name": "highlight",
            "target": target,
        }

        if highlightId is not None:
            payload["highlightId"] = highlightId

        actions.user.private_cursorless_command_and_wait(
            payload,
        )
