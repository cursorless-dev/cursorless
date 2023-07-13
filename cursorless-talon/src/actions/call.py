from ..command import cursorless_command_and_wait
from ..targets.target_types import CursorlessTarget, ImplicitTarget


def cursorless_call_action(target: CursorlessTarget):
    cursorless_command_and_wait(
        {
            "name": "callAsFunction",
            "callee": target,
            "argument": ImplicitTarget(),
        }
    )
