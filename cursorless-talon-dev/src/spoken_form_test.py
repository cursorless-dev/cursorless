import json
from typing import Any

from talon import Context, Module, actions

mod = Module()

mod.mode(
    "cursorless_spoken_form_test",
    "Performed testing on the Cursorless spoken forms/grammar",
)

ctx = Context()

ctx.matches = r"""
mode: user.cursorless_spoken_form_test
"""

ctx.tags = ["user.cursorless", "user.cursorless_default_vocabulary"]

active_microphone = "None"
actual_command = None


@ctx.action_class("user")
class UserActions:
    def did_emit_pre_phrase_signal():
        return True

    def private_cursorless_run_rpc_command_and_wait(
        command_id: str, arg1: Any, arg2: Any = None
    ):
        global actual_command
        actual_command = arg1

    def private_cursorless_run_rpc_command_no_wait(
        command_id: str, arg1: Any, arg2: Any = None
    ):
        global actual_command
        actual_command = arg1

    def private_cursorless_run_rpc_command_get(
        command_id: str, arg1: Any, arg2: Any = None
    ) -> Any:
        global actual_command
        actual_command = arg1


@mod.action_class
class Actions:
    def private_cursorless_spoken_form_test_mode(enable: bool):
        """Enable/disable Cursorless spoken form test mode"""
        global active_microphone

        if enable:
            actions.app.notify(
                "Cursorless spoken form tests are running. Talon microphone is disabled."
            )

            active_microphone = actions.sound.active_microphone()
            actions.sound.set_microphone("None")

            actions.mode.save()
            actions.mode.disable("command")
            actions.mode.disable("dictation")
            actions.mode.disable("sleep")
            actions.mode.enable("user.cursorless_spoken_form_test")
        else:
            actions.mode.restore()
            actions.sound.set_microphone(active_microphone)
            actions.app.notify(
                "Cursorless spoken form tests are done. Talon microphone is re-enabled."
            )

    def private_cursorless_spoken_form_test(phrase: str):
        """Run Cursorless spoken form test"""
        global actual_command
        actual_command = None

        try:
            actions.mimic(phrase)
            print(json.dumps(actual_command))
        except Exception as e:
            print(f"{e.__class__.__name__}: {e}")
