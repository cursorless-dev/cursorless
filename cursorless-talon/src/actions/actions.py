from talon import Module, actions, app

from ..csv_overrides import init_csv_and_watch_changes
from ..targets.target_types import CursorlessTarget, ImplicitTarget
from .actions_callback import callback_action_defaults, callback_action_map
from .actions_simple import (
    no_wait_actions,
    no_wait_actions_post_sleep,
    simple_action_defaults,
)
from .bring_move import BringMoveTargets
from .execute_command import cursorless_execute_command_action

mod = Module()


mod.list("cursorless_experimental_action", "Experimental actions")


@mod.capture(
    rule=(
        "{user.cursorless_simple_action} |"
        "{user.cursorless_experimental_action} |"
        "{user.cursorless_callback_action} |"
        "{user.cursorless_custom_action}"
    )
)
def cursorless_action_or_ide_command(m) -> dict:
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
        if action_name in callback_action_map:
            callback_action_map[action_name](target)
        elif action_name in ["replaceWithTarget", "moveToTarget"]:
            actions.user.cursorless_bring_move(
                action_name, BringMoveTargets(target, ImplicitTarget())
            )
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

    def private_cursorless_action_or_ide_command(
        instruction: dict, target: CursorlessTarget
    ):
        """Perform cursorless action or ide command on target (internal use only)"""
        type = instruction["type"]
        value = instruction["value"]
        if type == "cursorless_action":
            actions.user.cursorless_command(value, target)
        elif type == "ide_command":
            actions.user.cursorless_ide_command(value, target)


default_values = {
    "simple_action": simple_action_defaults,
    "callback_action": callback_action_defaults,
    "paste_action": {"paste": "pasteFromClipboard"},
    "bring_move_action": {"bring": "replaceWithTarget", "move": "moveToTarget"},
    "swap_action": {"swap": "swapTargets"},
    "wrap_action": {"wrap": "wrapWithPairedDelimiter", "repack": "rewrap"},
    "insert_snippet_action": {"snippet": "insertSnippet"},
    "reformat_action": {"format": "applyFormatter"},
}


ACTION_LIST_NAMES = list(default_values.keys()) + ["experimental_action"]


def on_ready() -> None:
    init_csv_and_watch_changes("actions", default_values)
    init_csv_and_watch_changes(
        "experimental/experimental_actions",
        {
            "experimental_action": {
                "-from": "experimental.setInstanceReference",
            }
        },
    )


app.register("ready", on_ready)
