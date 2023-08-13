from typing import Any

from talon import Module, actions

mod = Module()


@mod.action_class
class Actions:
    def private_cursorless_run_rpc_command_and_wait(
        command_id: str, arg1: Any = None, arg2: Any = None
    ):
        """Execute command via rpc and wait for command to finish."""
        try:
            actions.user.run_rpc_command_and_wait(command_id, arg1, arg2)
        except KeyError:
            actions.user.vscode_with_plugin_and_wait(command_id, arg1, arg2)

    def private_cursorless_run_rpc_command_no_wait(
        command_id: str, arg1: Any = None, arg2: Any = None
    ):
        """Execute command via rpc and DON'T wait."""
        try:
            actions.user.run_rpc_command(command_id, arg1, arg2)
        except KeyError:
            actions.user.vscode_with_plugin(command_id, arg1, arg2)

    def private_cursorless_run_rpc_command_get(
        command_id: str, arg1: Any = None, arg2: Any = None
    ) -> Any:
        """Execute command via rpc and return command output."""
        try:
            return actions.user.run_rpc_command_get(command_id, arg1, arg2)
        except KeyError:
            return actions.user.vscode_get(command_id, arg1, arg2)
