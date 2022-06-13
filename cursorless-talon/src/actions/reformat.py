from talon import Module, actions

from .get_text import get_text

mod = Module()

mod.list("cursorless_reformat_action", desc="Cursorless reformat action")


@mod.action_class
class Actions:
    def cursorless_reformat(targets: dict, formatters: str):
        """Reformat targets with formatter"""
        texts = get_text(targets, show_decorations=False)
        updated_texts = list(
            map(lambda text: actions.user.reformat_text(text, formatters), texts)
        )
        actions.user.cursorless_replace(targets, updated_texts)
