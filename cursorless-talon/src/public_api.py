from typing import Any, Optional

from talon import Module, actions

from .targets.target_types import (
    CursorlessDestination,
    InsertionMode,
    ListTarget,
    PrimitiveDestination,
    PrimitiveTarget,
    RangeTarget,
)

mod = Module()


@mod.action_class
class Actions:
    @staticmethod
    def cursorless_create_destination(
        target: ListTarget | RangeTarget | PrimitiveTarget,
        insertion_mode: InsertionMode = "to",
    ) -> CursorlessDestination:
        """Cursorless: Create destination from target"""
        return PrimitiveDestination(insertion_mode, target)


@mod.action_class
class CommandActions:
    @staticmethod
    def cursorless_x_custom_command(
        content: str,
        arg1: Optional[Any] = None,
        arg2: Optional[Any] = None,
        arg3: Optional[Any] = None,
    ):
        """Cursorless: Run custom parsed command"""
        actions.user.private_cursorless_command_and_wait(
            {
                "name": "parsed",
                "content": content,
                "arguments": [arg for arg in [arg1, arg2, arg3] if arg is not None],
            }
        )
