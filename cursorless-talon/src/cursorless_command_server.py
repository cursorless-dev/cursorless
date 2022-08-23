from .command import Any, NotSet
import string

from talon import Module, actions, Context

mod = Module()

mod.tag(
    "cursorless", desc="commands for accessing command server with fallbacks to old commands"
)

ctx = Context()
ctx.tags = r"""command_client"""

@mod.action_class
class cs_actions:
  def fs_run_command(command_id: str):
        """Execute command via application command server, if available, or fallback to vs code handler"""
        actions.user.run_command(command_id)

  def fs_run_command_and_wait(command_id: str):
      """Execute command via application command server, if available, and wait
      for command to finish.  If command server not available, uses command
      palette and doesn't guarantee that it will wait for command to
      finish."""
      
      actions.user.run_command_and_wait(command_id)
      

  def fs_run_command_with_plugin(
      command_id: str,
      arg1: Any = NotSet,
      arg2: Any = NotSet,
      arg3: Any = NotSet,
      arg4: Any = NotSet,
      arg5: Any = NotSet,
  ):
      """Execute command via application command server."""
      actions.user.vscode_with_plugin(
          command_id,
          arg1,
          arg2,
          arg3,
          arg4,
          arg5,
      )

  def fs_run_command_with_plugin_and_wait(
      action: str,
      arg1: Any = NotSet,
      arg2: Any = NotSet,
      arg3: Any = NotSet,
      arg4: Any = NotSet,
      arg5: Any = NotSet,
  ):
      """Execute command via application command server and wait for command to finish."""
      print("******************Running fallback")
      return actions.user.vscode_with_plugin_and_wait(
          action,
          arg1,
          arg2,
          arg3,
          arg4,
          arg5    
      )

  def run_command_get(
      command_id: str,
      arg1: Any = NotSet,
      arg2: Any = NotSet,
      arg3: Any = NotSet,
      arg4: Any = NotSet,
      arg5: Any = NotSet,
  ) -> Any:
      """Execute command via application command server and return command output."""
      return actions.user.run_command_get(
          command_id,
          arg1,
          arg2,
          arg3,
          arg4,
          arg5
      )