from .command import Any, NotSet
import string

from talon import Module, actions

mod = Module()

@mod.action_class
class cs_actions:
  def cursorless_run_rpc_command(
        action: str,
        command: Any
  ):
      """Execute command via application command server."""
      try:
        actions.user.run_rpc_command(action, command)
      except KeyError:
        actions.user.vscode_with_plugin(action,command)

  def cursorless_run_rpc_command_and_wait(
      action: str,
      command: Any
  ):
      """Execute command via application command server and wait for command to finish."""
      try: 
        actions.user.run_rpc_command_and_wait(
            action,
            command
        )
      except KeyError:  
        actions.user.vscode_with_plugin_and_wait(
          action,
          command
        )

  def cursorless_run_rpc_command_get(
      action: str,
      command: Any,
  ) -> Any:
      """Execute command via application command server and return command output."""
      try:
        return actions.user.run_rpc_command_get(
            action,
            command
        )
      except KeyError:
        return action.user.vscode_get(action,command)