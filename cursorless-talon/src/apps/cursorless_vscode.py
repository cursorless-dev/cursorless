from talon import Context, actions

from ..actions.get_text import get_text

ctx = Context()

ctx.matches = r"""
app: vscode
"""

ctx.tags = ["user.cursorless"]


@ctx.action_class("user")
class Actions:
    def cursorless_private_run_find_action(targets: dict):
        """Find text of targets in editor"""
        texts = get_text(targets, ensure_single_target=True)
        actions.user.cursorless_private_run_rpc_command_no_wait("actions.find")
        actions.sleep("50ms")
        actions.insert(texts[0])

    def cursorless_show_settings_in_ide():
        """Show Cursorless-specific settings in ide"""
        actions.user.cursorless_private_run_rpc_command_no_wait(
            "workbench.action.openGlobalSettings"
        )
        actions.sleep("250ms")
        actions.insert("cursorless")
