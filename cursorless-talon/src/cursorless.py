from talon import Module

mod = Module()

mod.tag(
    "cursorless",
    "Application supporting cursorless commands",
)


@mod.action_class
class Actions:
    def cursorless_show_settings_in_ide():
        """Show Cursorless-specific settings in ide"""
