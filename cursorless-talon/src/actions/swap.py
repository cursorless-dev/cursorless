from dataclasses import dataclass

from talon import Module, actions

from ..targets.target_types import CursorlessTarget, ImplicitTarget


@dataclass
class SwapTargets:
    target1: CursorlessTarget
    target2: CursorlessTarget


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
def cursorless_swap_targets(m) -> SwapTargets:
    targets = m.cursorless_target_list

    return SwapTargets(
        ImplicitTarget() if len(targets) == 1 else targets[0],
        targets[-1],
    )


@mod.action_class
class Actions:
    def private_cursorless_swap(targets: SwapTargets):
        """Execute Cursorless swap action"""
        actions.user.private_cursorless_command_and_wait(
            {
                "name": "swapTargets",
                "target1": targets.target1,
                "target2": targets.target2,
            }
        )
