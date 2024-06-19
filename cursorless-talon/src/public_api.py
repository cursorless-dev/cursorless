from typing import Optional

from talon import Module, actions

from .targets.target_types import (
    CursorlessDestination,
    CursorlessTarget,
    InsertionMode,
    ListTarget,
    PrimitiveDestination,
    PrimitiveTarget,
    RangeTarget,
)

mod = Module()


@mod.action_class
class Actions:
    def cursorless_create_destination(
        target: ListTarget | RangeTarget | PrimitiveTarget,  # pyright: ignore [reportGeneralTypeIssues]
        insertion_mode: InsertionMode = "to",
    ) -> CursorlessDestination:
        """Cursorless: Create destination from target"""
        return PrimitiveDestination(insertion_mode, target)


@mod.action_class
class CommandActions:
    def cursorless_custom_command(
        content: str,  # pyright: ignore [reportGeneralTypeIssues]
        target1: Optional[CursorlessTarget] = None,
        target2: Optional[CursorlessTarget] = None,
        target3: Optional[CursorlessTarget] = None,
    ):
        """Cursorless: Run custom parsed command"""
        actions.user.private_cursorless_command_and_wait(
            {
                "name": "parsed",
                "content": content,
                "targets": [
                    target
                    for target in [target1, target2, target3]
                    if target is not None
                ],
            }
        )
