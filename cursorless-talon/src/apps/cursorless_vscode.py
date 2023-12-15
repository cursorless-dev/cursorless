from talon import Context, actions, app

from ..actions.get_text import cursorless_get_text_action
from ..targets.target_types import CursorlessTarget

ctx = Context()

ctx.matches = r"""
app: vscode
"""

ctx.tags = ["user.cursorless"]


@ctx.action_class("user")
class Actions:
    def private_cursorless_show_settings_in_ide():
        """Show Cursorless-specific settings in ide"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "workbench.action.openSettings", "@ext:pokey.cursorless "
        )
        actions.sleep("250ms")
        actions.key("right")

    def private_cursorless_show_sidebar():
        """Show Cursorless sidebar"""
        actions.user.private_cursorless_run_rpc_command_and_wait(
            "workbench.view.extension.cursorless"
        )
