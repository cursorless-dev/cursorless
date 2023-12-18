import json
from typing import Any, Optional

from talon import Context, Module, actions, scope

mod = Module()

mod.mode(
    "cursorless_spoken_form_test",
    "Used to run tests on the Cursorless spoken forms/grammar",
)

ctx = Context()

ctx.matches = r"""
mode: user.cursorless_spoken_form_test
"""

ctx.tags = [
    "user.cursorless",
    "user.cursorless_default_vocabulary",
]

# Keeps track of the microphone that was active before the spoken form test mode
saved_microphone = "None"

# Keeps a list of modes that were active before the spoken form test mode was
# enabled
saved_modes = []

# Keeps a list of commands run over the course of a spoken form test
commands_run = []

mockedGetValue = ""


@ctx.action_class("user")
class UserActions:
    def did_emit_pre_phrase_signal():
        return True

    def private_cursorless_run_rpc_command_and_wait(
        command_id: str, arg1: Any, arg2: Any = None
    ):
        commands_run.append(arg1)

    def private_cursorless_run_rpc_command_no_wait(
        command_id: str, arg1: Any, arg2: Any = None
    ):
        commands_run.append(arg1)

    def private_cursorless_run_rpc_command_get(
        command_id: str, arg1: Any, arg2: Any = None
    ) -> Any:
        commands_run.append(arg1)
        return mockedGetValue


@mod.action_class
class Actions:
    def private_cursorless_spoken_form_test_mode(enable: bool):
        """Enable/disable Cursorless spoken form test mode"""
        global saved_modes, saved_microphone

        if enable:
            saved_modes = scope.get("mode")
            saved_microphone = actions.sound.active_microphone()

            disable_modes()
            actions.mode.enable("user.cursorless_spoken_form_test")
            actions.sound.set_microphone("None")

            actions.app.notify(
                "Cursorless spoken form tests are running. Talon microphone is disabled."
            )
        else:
            actions.mode.disable("user.cursorless_spoken_form_test")
            enable_modes()
            actions.sound.set_microphone(saved_microphone)

            actions.app.notify(
                "Cursorless spoken form tests are done. Talon microphone is re-enabled."
            )

    def private_cursorless_spoken_form_test(
        phrase: str, mockedGetValue_: Optional[str]
    ):
        """Run Cursorless spoken form test"""
        global commands_run, mockedGetValue
        commands_run = []
        if mockedGetValue_:
            mockedGetValue = json.loads(mockedGetValue_)

        try:
            actions.mimic(phrase)
            print(json.dumps(commands_run))
        except Exception as e:
            print(f"{e.__class__.__name__}: {e}")


def enable_modes():
    for mode in saved_modes:
        try:
            actions.mode.enable(mode)
        except Exception:
            pass


def disable_modes():
    for mode in saved_modes:
        try:
            actions.mode.disable(mode)
        except Exception:
            pass
