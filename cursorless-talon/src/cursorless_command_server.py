from typing import Any

from talon import actions


def run_rpc_command_no_wait(command_id: str, *args):
    """Execute command via rpc."""
    try:
        actions.user.run_rpc_command(command_id, *args)
    except KeyError:
        actions.user.vscode_with_plugin(command_id, *args)


def run_rpc_command_and_wait(command_id: str, *args):
    """Execute command via rpc and wait for command to finish."""
    try:
        actions.user.run_rpc_command_and_wait(command_id, *args)
    except KeyError:
        actions.user.vscode_with_plugin_and_wait(command_id, *args)


def run_rpc_command_get(command_id: str, *args) -> Any:
    """Execute command via rpc and return command output."""
    try:
        return actions.user.run_rpc_command_get(command_id, *args)
    except KeyError:
        return actions.user.vscode_get(command_id, *args)
