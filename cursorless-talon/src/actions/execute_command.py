from talon import actions

from ..targets.target_types import CursorlessTarget


def cursorless_execute_command_action(
    command_id: str, target: CursorlessTarget, command_options: dict = {}
):
    """Execute Cursorless execute command action"""
    actions.user.private_cursorless_command_and_wait(
        {
            "name": "executeCommand",
            "commandId": command_id,
            "options": command_options,
            "target": target,
        }
    )
