import dataclasses
from typing import Any

from talon import Module, actions, speech_system

from .fallback import perform_fallback
from .versions import COMMAND_VERSION


@dataclasses.dataclass
class CursorlessCommand:
    version = COMMAND_VERSION
    spokenForm: str
    usePrePhraseSnapshot: bool
    action: dict


CURSORLESS_COMMAND_ID = "cursorless.command"
last_phrase = None

mod = Module()


def on_phrase(d):
    global last_phrase
    last_phrase = d


speech_system.register("pre:phrase", on_phrase)


@mod.action_class
class Actions:
    def private_cursorless_command_and_wait(action: dict):
        """Execute cursorless command and wait for it to finish"""
        response = actions.user.private_cursorless_run_rpc_command_get(
            CURSORLESS_COMMAND_ID,
            construct_cursorless_command(action),
        )
        if "fallback" in response:
            perform_fallback(response["fallback"])

    def private_cursorless_command_no_wait(action: dict):
        """Execute cursorless command without waiting"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            CURSORLESS_COMMAND_ID,
            construct_cursorless_command(action),
        )

    def private_cursorless_command_get(action: dict):
        """Execute cursorless command and return result"""
        response = actions.user.private_cursorless_run_rpc_command_get(
            CURSORLESS_COMMAND_ID,
            construct_cursorless_command(action),
        )
        if "fallback" in response:
            return perform_fallback(response["fallback"])
        if "returnValue" in response:
            return response["returnValue"]
        return None


def construct_cursorless_command(action: dict) -> dict:
    try:
        use_pre_phrase_snapshot = actions.user.did_emit_pre_phrase_signal()
    except KeyError:
        use_pre_phrase_snapshot = False

    spoken_form = " ".join(last_phrase["phrase"])

    return make_serializable(
        CursorlessCommand(
            spoken_form,
            use_pre_phrase_snapshot,
            action,
        )
    )


def make_serializable(value: Any) -> Any:
    """
    Converts a dataclass into a serializable dict

    Note that we don't use the built-in asdict() function because it will
    ignore the static `type` field.

    Args:
        value (any): The value to convert

    Returns:
        _type_: The converted value, ready for serialization
    """
    if isinstance(value, dict):
        return {k: make_serializable(v) for k, v in value.items()}
    if isinstance(value, list):
        return [make_serializable(v) for v in value]
    if dataclasses.is_dataclass(value):
        items = {
            **{k: v for k, v in value.__class__.__dict__.items() if k[0] != "_"},
            **value.__dict__,
        }
        return {k: make_serializable(v) for k, v in items.items() if v is not None}
    return value
