from talon import Module, actions

from ..targets.target_types import CursorlessTarget
from .get_text import cursorless_get_text
from .replace import cursorless_replace_action

mod = Module()

mod.list("cursorless_reformat_action", desc="Cursorless reformat action")


@mod.action_class
class Actions:
    def private_cursorless_reformat(target: CursorlessTarget, formatters: str):
        """Execute Cursorless reformat action. Reformat target with formatter"""
        texts = cursorless_get_text(target, show_decorations=False)
        updated_texts = [actions.user.reformat_text(text, formatters) for text in texts]
        cursorless_replace_action(target, updated_texts)
