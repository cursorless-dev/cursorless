from talon import Module, actions

from ..targets.target_types import CursorlessTarget

mod = Module()

mod.list("cursorless_wrap_action", desc="Cursorless wrap action")


@mod.action_class
class Actions:
    def private_cursorless_wrap_with_paired_delimiter(
        action_name: str,  # pyright: ignore [reportGeneralTypeIssues]
        target: CursorlessTarget,
        paired_delimiter: list[str],
    ):
        """Execute Cursorless wrap/rewrap with paired delimiter action"""
        if action_name == "rewrap":
            action_name = "rewrapWithPairedDelimiter"

        actions.user.private_cursorless_command_and_wait(
            {
                "name": action_name,
                "left": paired_delimiter[0],
                "right": paired_delimiter[1],
                "target": target,
            }
        )
