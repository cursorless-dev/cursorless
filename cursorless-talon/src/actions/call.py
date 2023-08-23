from talon import actions

from ..targets.target_types import CursorlessTarget, ImplicitTarget


def cursorless_call_action(target: CursorlessTarget):
    actions.user.private_cursorless_command_and_wait(
        {
            "name": "callAsFunction",
            "callee": target,
            "argument": ImplicitTarget(),
        }
    )
