from talon import Module, actions

from ..targets.target_types import CursorlessDestination

mod = Module()

mod.list("cursorless_paste_action", desc="Cursorless paste action")


@mod.action_class
class Actions:
    def private_cursorless_paste(destination: CursorlessDestination):
        """Execute Cursorless paste action"""
        actions.user.private_cursorless_command_and_wait(
            {
                "name": "pasteFromClipboard",
                "destination": destination,
            }
        )
