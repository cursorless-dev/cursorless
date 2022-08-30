from talon import actions, Context

from .get_text import get_text

ctx = Context()

ctx.matches = r"""
app: vscode
"""

@ctx.action_class("user")
class VsCodeAction:
    def run_find_action(targets: dict):
        """Find text in editor"""
        texts = get_text(targets, ensure_single_target=True)
        actions.user.vscode("actions.find")
        actions.sleep("50ms")
        actions.insert(texts[0])