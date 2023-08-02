from talon import Module

from ..targets.target_types import CursorlessTarget

mod = Module()


@mod.action_class
class Actions:
    def private_cursorless_find(target: CursorlessTarget):
        """Execute Cursorless find action. Find text of target in editor"""
