from ..primitive_target import IMPLICIT_TARGET
from talon import Module, actions

mod = Module()


def run_call_action(target: dict):
    targets = [target, IMPLICIT_TARGET]
    actions.user.cursorless_multiple_target_command("callAsFunction", targets)
