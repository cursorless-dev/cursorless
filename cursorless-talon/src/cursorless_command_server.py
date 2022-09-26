from talon import Module, actions

from .command import Any

mod = Module()


class NotSet:
    def __repr__(self):
        return "<argument not set>"


def filter_args(*args):
    return [x for x in args if x is not NotSet]


@mod.action_class
class Actions:
    def cursorless_private_run_rpc_command_no_wait(
        command_id: str,
        arg1: Any = NotSet,
        arg2: Any = NotSet,
        arg3: Any = NotSet,
        arg4: Any = NotSet,
        arg5: Any = NotSet,
    ):
        """Execute command via rpc."""
        args = filter_args(arg1, arg2, arg3, arg4, arg5)
        try:
            actions.user.run_rpc_command(command_id, *args)
        except KeyError:
            actions.user.vscode_with_plugin(command_id, *args)

    def cursorless_private_run_rpc_command_and_wait(
        command_id: str,
        arg1: Any = NotSet,
        arg2: Any = NotSet,
        arg3: Any = NotSet,
        arg4: Any = NotSet,
        arg5: Any = NotSet,
    ):
        """Execute command via rpc and wait for command to finish."""
        args = filter_args(arg1, arg2, arg3, arg4, arg5)
        try:
            actions.user.run_rpc_command_and_wait(command_id, *args)
        except KeyError:
            actions.user.vscode_with_plugin_and_wait(command_id, *args)

    def cursorless_private_run_rpc_command_get(
        command_id: str,
        arg1: Any = NotSet,
        arg2: Any = NotSet,
        arg3: Any = NotSet,
        arg4: Any = NotSet,
        arg5: Any = NotSet,
    ) -> Any:
        """Execute command via rpc and return command output."""
        args = filter_args(arg1, arg2, arg3, arg4, arg5)
        try:
            return actions.user.run_rpc_command_get(command_id, *args)
        except KeyError:
            return actions.user.vscode_get(command_id, *args)
