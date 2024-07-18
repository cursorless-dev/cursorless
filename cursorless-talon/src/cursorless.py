from talon import Module, actions

mod = Module()

mod.tag(
    "cursorless",
    "Application supporting cursorless commands",
)


@mod.action_class
class Actions:
    def private_cursorless_show_settings_in_ide():
        """Show Cursorless-specific settings in ide"""

    def private_cursorless_show_sidebar():
        """Show Cursorless-specific settings in ide"""

    def private_cursorless_show_command_statistics():
        """Show Cursorless command statistics"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.analyzeCommandHistory"
        )
