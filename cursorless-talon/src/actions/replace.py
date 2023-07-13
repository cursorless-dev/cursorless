from ..command import cursorless_command_and_wait
from ..targets.target_types import CursorlessTarget, PrimitiveDestination


def cursorless_replace_action(target: CursorlessTarget, replace_with: list[str]):
    """Execute Cursorless replace action. Replace targets with texts"""
    cursorless_command_and_wait(
        {
            "name": "replace",
            "replaceWith": replace_with,
            "destination": PrimitiveDestination("to", target),
        }
    )
