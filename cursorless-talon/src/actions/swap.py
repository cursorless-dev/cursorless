from talon import Module

from ..command import cursorless_command_and_wait
from ..targets.target_types import CursorlessTarget, PrimitiveTarget

mod = Module()

mod.list("cursorless_swap_action", desc="Cursorless swap action")
mod.list(
    "cursorless_swap_connective",
    desc="The connective used to separate swap targets",
)


@mod.capture(
    rule=(
        "[<user.cursorless_target>] {user.cursorless_swap_connective} <user.cursorless_target>"
    )
)
def cursorless_swap_targets(m) -> list[CursorlessTarget]:
    targets = m.cursorless_target_list

    if len(targets) == 1:
        [PrimitiveTarget(), targets[0]]

    return targets


@mod.action_class
class Actions:
    def private_cursorles_swap(targets: list[CursorlessTarget]):
        """Execute Cursorless swap action"""
        cursorless_command_and_wait(
            {
                "name": "swapTargets",
                "target1": targets[0],
                "target2": targets[1],
            }
        )
