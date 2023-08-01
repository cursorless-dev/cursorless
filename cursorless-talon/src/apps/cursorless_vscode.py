from talon import Context, actions, app

from ..actions.get_text import get_text

ctx = Context()

ctx.matches = r"""
app: vscode
"""

ctx.tags = ["user.cursorless"]


@ctx.action_class("user")
class Actions:
    def cursorless_private_run_find_action(target: dict):
        """Find text of target in editor"""
        texts = get_text(target, ensure_single_target=True)
        search_text = texts[0]
        if len(search_text) > 200:
            search_text = search_text[:200]
            app.notify("Search text is longer than 200 characters; truncating")
        actions.user.private_cursorless_run_rpc_command_no_wait("actions.find")
        actions.sleep("50ms")
        actions.insert(search_text)

    def cursorless_show_settings_in_ide():
        """Show Cursorless-specific settings in ide"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "workbench.action.openGlobalSettings"
        )
        actions.sleep("250ms")
        actions.insert("cursorless")
