from talon import Module, actions

from ..targets.target_types import CursorlessTarget, PrimitiveDestination
from .get_text import cursorless_get_text_action
from .replace import cursorless_replace_action

mod = Module()

mod.list("cursorless_reformat_action", desc="Cursorless reformat action")


@mod.action_class
class Actions:
    def private_cursorless_reformat(target: CursorlessTarget, formatters: str):
        """Execute Cursorless reformat action. Reformat target with formatter"""
        texts = cursorless_get_text_action(target, show_decorations=False)
        updated_texts = [actions.user.reformat_text(text, formatters) for text in texts]
        destination = PrimitiveDestination("to", target)
        cursorless_replace_action(destination, updated_texts)
