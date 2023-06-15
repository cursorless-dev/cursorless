from talon import Module, actions

from .get_text import get_text

mod = Module()

mod.list("cursorless_reformat_action", desc="Cursorless reformat action")


@mod.action_class
class Actions:
    def cursorless_reformat(target: dict, formatters: str):
        """Reformat target with formatter"""
        texts = get_text(target, show_decorations=False)
        updated_texts = [actions.user.reformat_text(text, formatters) for text in texts]
        actions.user.cursorless_replace(target, updated_texts)
