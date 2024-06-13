from talon import Module

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
    def cursorless_create_destination(
        target: ListTarget | RangeTarget | PrimitiveTarget,  # pyright: ignore [reportGeneralTypeIssues]
        insertion_mode: InsertionMode = "to",
    ) -> CursorlessDestination:
        """Cursorless: Create destination from target"""
        return PrimitiveDestination(insertion_mode, target)
