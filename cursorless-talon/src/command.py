import dataclasses

from talon import actions, speech_system

from .cursorless_command_server import (
    run_rpc_command_and_wait,
    run_rpc_command_get,
    run_rpc_command_no_wait,
)


@dataclasses.dataclass
class CursorlessCommand:
    version = 6
    spokenForm: str
    usePrePhraseSnapshot: bool
    action: dict


CURSORLESS_COMMAND_ID = "cursorless.command"
last_phrase = None


def on_phrase(d):
    global last_phrase
    last_phrase = d


speech_system.register("pre:phrase", on_phrase)


def cursorless_command_and_wait(action: dict):
    """Execute cursorless command and wait for it to finish"""
    run_rpc_command_and_wait(
        CURSORLESS_COMMAND_ID,
        construct_cursorless_command(action),
    )


def cursorless_command_no_wait(action: dict):
    """Execute cursorless command without waiting"""
    run_rpc_command_no_wait(
        CURSORLESS_COMMAND_ID,
        construct_cursorless_command(action),
    )


def cursorless_command_get(action: dict):
    """Execute cursorless command and return result"""
    return run_rpc_command_get(
        CURSORLESS_COMMAND_ID,
        construct_cursorless_command(action),
    )


def construct_cursorless_command(action: dict) -> dict:
    try:
        use_pre_phrase_snapshot = actions.user.did_emit_pre_phrase_signal()
    except KeyError:
        use_pre_phrase_snapshot = False

    return makes_serializable(
        CursorlessCommand(
            get_spoken_form(),
            use_pre_phrase_snapshot,
            action,
        )
    )


def get_spoken_form():
    return " ".join(last_phrase["phrase"])


def makes_serializable(value: any):
    if isinstance(value, dict):
        return {k: makes_serializable(v) for k, v in value.items()}
    if isinstance(value, list):
        return [makes_serializable(v) for v in value]
    if dataclasses.is_dataclass(value):
        items = {
            **{k: v for k, v in value.__class__.__dict__.items() if k[0] != "_"},
            **value.__dict__,
        }
        return {k: makes_serializable(v) for k, v in items.items()}
    return value
