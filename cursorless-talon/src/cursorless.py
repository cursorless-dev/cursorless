from talon import Module

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
