from dataclasses import dataclass

from talon import Module, actions

from ..targets.target_types import (
    CursorlessDestination,
    CursorlessTarget,
    ImplicitDestination,
)


@dataclass
class BringMoveTargets:
    source: CursorlessTarget
    destination: CursorlessDestination


mod = Module()


mod.list("cursorless_bring_move_action", desc="Cursorless bring or move actions")


@mod.capture(rule="<user.cursorless_target> [<user.cursorless_destination>]")
def cursorless_bring_move_targets(m) -> BringMoveTargets:
    source = m.cursorless_target

    try:
        destination = m.cursorless_destination
    except AttributeError:
        destination = ImplicitDestination()

    return BringMoveTargets(source, destination)


@mod.action_class
class Actions:
    def private_cursorless_bring_move(action_name: str, targets: BringMoveTargets):
        """Execute Cursorless move/bring action"""
        actions.user.private_cursorless_command_and_wait(
            {
                "name": action_name,
                "source": targets.source,
                "destination": targets.destination,
            }
        )
