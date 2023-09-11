from talon import actions

from ..targets.target_types import CursorlessDestination


def cursorless_replace_action(
    destination: CursorlessDestination, replace_with: list[str]
):
    """Execute Cursorless replace action. Replace targets with texts"""
    actions.user.private_cursorless_command_and_wait(
        {
            "name": "replace",
            "replaceWith": replace_with,
            "destination": destination,
        }
    )
