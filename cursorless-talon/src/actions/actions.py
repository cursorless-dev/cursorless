from typing import Callable, Union

from talon import Module, actions

from ..targets.target_types import (
    CursorlessDestination,
    CursorlessTarget,
    ImplicitDestination,
)
from .bring_move import BringMoveTargets
from .execute_command import cursorless_execute_command_action
from .homophones import cursorless_homophones_action
from .replace import cursorless_replace_action

mod = Module()

mod.list(
    "cursorless_simple_action",
    desc="Cursorless internal: simple actions",
)

mod.list(
    "cursorless_callback_action",
    desc="Cursorless internal: actions implemented via a callback function",
)

mod.list(
    "cursorless_custom_action",
    desc="Cursorless internal: user-defined custom actions",
)

mod.list(
    "cursorless_experimental_action",
    desc="Cursorless internal: experimental actions",
)

ACTION_LIST_NAMES = [
    "simple_action",
    "callback_action",
    "paste_action",
    "bring_move_action",
    "swap_action",
    "wrap_action",
    "insert_snippet_action",
    "reformat_action",
    "call_action",
    "experimental_action",
    "custom_action",
]

callback_actions: dict[str, Callable[[CursorlessTarget], None]] = {
    "findInDocument": actions.user.private_cursorless_find,
    "nextHomophone": cursorless_homophones_action,
}

# Don't wait for these actions to finish, usually because they hang on some kind of user interaction
no_wait_actions = [
    "generateSnippet",
    "rename",
]

# These are actions that we don't wait for, but still want to have a post action sleep
no_wait_actions_post_sleep = {
    "rename": 0.3,
}


@mod.capture(
    rule=(
        "{user.cursorless_simple_action} |"
        "{user.cursorless_experimental_action} |"
        "{user.cursorless_callback_action} |"
        "{user.cursorless_call_action} |"
        "{user.cursorless_custom_action}"
    )
)
def cursorless_action_or_ide_command(m) -> dict[str, str]:
    try:
        value = m.cursorless_custom_action
        type = "ide_command"
    except AttributeError:
        value = m[0]
        type = "cursorless_action"
    return {
        "value": value,
        "type": type,
    }


@mod.action_class
class Actions:
    def cursorless_command(action_name: str, target: CursorlessTarget):
        """Perform cursorless command on target"""
        if action_name in callback_actions:
            callback_actions[action_name](target)
        elif action_name in ["replaceWithTarget", "moveToTarget"]:
            actions.user.private_cursorless_bring_move(
                action_name, BringMoveTargets(target, ImplicitDestination())
            )
        elif action_name == "callAsFunction":
            actions.user.private_cursorless_call(target)
        elif action_name in no_wait_actions:
            action = {"name": action_name, "target": target}
            actions.user.private_cursorless_command_no_wait(action)
            if action_name in no_wait_actions_post_sleep:
                actions.sleep(no_wait_actions_post_sleep[action_name])
        else:
            action = {"name": action_name, "target": target}
            actions.user.private_cursorless_command_and_wait(action)

    def cursorless_vscode_command(command_id: str, target: CursorlessTarget):
        """
        Perform vscode command on cursorless target

        Deprecated: prefer `cursorless_ide_command`
        """
        return actions.user.cursorless_ide_command(command_id, target)

    def cursorless_ide_command(command_id: str, target: CursorlessTarget):
        """Perform ide command on cursorless target"""
        return cursorless_execute_command_action(command_id, target)

    def cursorless_insert(
        destination: CursorlessDestination, text: Union[str, list[str]]
    ):
        """Perform text insertion on Cursorless destination"""
        if isinstance(text, str):
            text = [text]
        cursorless_replace_action(destination, text)

    def private_cursorless_action_or_ide_command(
        instruction: dict[str, str], target: CursorlessTarget
    ):
        """Perform cursorless action or ide command on target (internal use only)"""
        type = instruction["type"]
        value = instruction["value"]
        if type == "cursorless_action":
            actions.user.cursorless_command(value, target)
        elif type == "ide_command":
            actions.user.cursorless_ide_command(value, target)
