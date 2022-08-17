from talon import Module, actions

from ..primitive_target import IMPLICIT_TARGET

mod = Module()


def run_call_action(target: dict):
    targets = [target, IMPLICIT_TARGET.copy()]
    actions.user.cursorless_multiple_target_command("callAsFunction", targets)
