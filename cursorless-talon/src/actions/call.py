from talon import Module, actions

from ..targets.target_types import CursorlessTarget, ImplicitTarget

mod = Module()
mod.list("cursorless_call_action", desc="Cursorless call action")


@mod.action_class
class Actions:
    def private_cursorless_call(
        callee: CursorlessTarget,
        argument: CursorlessTarget = ImplicitTarget(),
    ):
        """Execute Cursorless call action"""
        actions.user.private_cursorless_command_and_wait(
            {
                "name": "callAsFunction",
                "callee": callee,
                "argument": argument,
            }
        )
