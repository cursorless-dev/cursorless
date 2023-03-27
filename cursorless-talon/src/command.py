from typing import Any

from talon import Module, actions, speech_system

from .cursorless_command_server import (
    run_rpc_command_and_wait,
    run_rpc_command_get,
    run_rpc_command_no_wait,
)
from .primitive_target import IMPLICIT_TARGET

mod = Module()

CURSORLESS_COMMAND_ID = "cursorless.command"
CURSORLESS_COMMAND_VERSION = 5
last_phrase = None


def on_phrase(d):
    global last_phrase
    last_phrase = d


speech_system.register("pre:phrase", on_phrase)


class NotSet:
    def __repr__(self):
        return "<argument not set>"


@mod.action_class
class Actions:
    def cursorless_single_target_command(
        action: str,
        target: dict,
        arg1: Any = NotSet,
        arg2: Any = NotSet,
        arg3: Any = NotSet,
    ):
        """Execute single-target cursorless command"""
        actions.user.cursorless_multiple_target_command(
            action, [target], arg1, arg2, arg3
        )

    def cursorless_single_target_command_no_wait(
        action: str,
        target: dict,
        arg1: Any = NotSet,
        arg2: Any = NotSet,
        arg3: Any = NotSet,
    ):
        """Execute single-target cursorless command"""
        actions.user.cursorless_multiple_target_command_no_wait(
            action, [target], arg1, arg2, arg3
        )

    def cursorless_single_target_command_with_arg_list(
        action: str, target: dict, args: list[Any]
    ):
        """Execute single-target cursorless command with argument list"""
        actions.user.cursorless_single_target_command(
            action,
            target,
            *args,
        )

    def cursorless_single_target_command_get(
        action: str,
        target: dict,
        arg1: Any = NotSet,
        arg2: Any = NotSet,
        arg3: Any = NotSet,
    ):
        """Execute single-target cursorless command and return result"""
        return run_rpc_command_get(
            CURSORLESS_COMMAND_ID,
            construct_cursorless_command_argument(
                action=action,
                targets=[target],
                args=[x for x in [arg1, arg2, arg3] if x is not NotSet],
            ),
        )

    def cursorless_implicit_target_command(
        action: str,
        arg1: Any = NotSet,
        arg2: Any = NotSet,
        arg3: Any = NotSet,
    ):
        """Execute cursorless command with implicit target"""
        actions.user.cursorless_single_target_command(
            action, IMPLICIT_TARGET, arg1, arg2, arg3
        )

    def cursorless_multiple_target_command(
        action: str,
        targets: list[dict],
        arg1: Any = NotSet,
        arg2: Any = NotSet,
        arg3: Any = NotSet,
    ):
        """Execute multi-target cursorless command"""
        run_rpc_command_and_wait(
            CURSORLESS_COMMAND_ID,
            construct_cursorless_command_argument(
                action=action,
                targets=targets,
                args=[x for x in [arg1, arg2, arg3] if x is not NotSet],
            ),
        )

    def cursorless_multiple_target_command_no_wait(
        action: str,
        targets: list[dict],
        arg1: Any = NotSet,
        arg2: Any = NotSet,
        arg3: Any = NotSet,
    ):
        """Execute multi-target cursorless command"""
        run_rpc_command_no_wait(
            CURSORLESS_COMMAND_ID,
            construct_cursorless_command_argument(
                action=action,
                targets=targets,
                args=[x for x in [arg1, arg2, arg3] if x is not NotSet],
            ),
        )


def construct_cursorless_command_argument(
    action: str, targets: list[dict], args: list[Any]
):
    try:
        use_pre_phrase_snapshot = actions.user.did_emit_pre_phrase_signal()
    except KeyError:
        use_pre_phrase_snapshot = False

    return {
        "version": CURSORLESS_COMMAND_VERSION,
        "spokenForm": get_spoken_form(),
        "action": {
            "name": action,
            "args": args,
        },
        "targets": targets,
        "usePrePhraseSnapshot": use_pre_phrase_snapshot,
    }


def get_spoken_form():
    return " ".join(last_phrase["phrase"])
