from talon import actions
from ..targets.target_types import CursorlessTarget, PrimitiveDestination


def cursorless_replace_action(target: CursorlessTarget, replace_with: list[str]):
    """Execute Cursorless replace action. Replace targets with texts"""
    actions.user.private_cursorless_command_and_wait(
        {
            "name": "replace",
            "replaceWith": replace_with,
            "destination": PrimitiveDestination("to", target),
        }
    )
