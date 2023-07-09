from talon import Module, actions

from ..primitive_target import create_implicit_target

mod = Module()


def run_call_action(target: dict):
    targets = [target, create_implicit_target()]
    actions.user.cursorless_multiple_target_command("callAsFunction", targets)
