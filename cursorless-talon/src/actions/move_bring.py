from talon import Module

from ..primitive_target import IMPLICIT_TARGET

mod = Module()
mod.list(
    "cursorless_source_destination_connective",
    desc="The connective used to separate source and destination targets",
)


mod.list("cursorless_move_bring_action", desc="Cursorless move or bring actions")


@mod.capture(
    rule=(
        "<user.cursorless_target> [{user.cursorless_source_destination_connective} <user.cursorless_target>]"
    )
)
def cursorless_move_bring_targets(m) -> list[dict]:
    target_list = m.cursorless_target_list

    if len(target_list) == 1:
        target_list = target_list + [IMPLICIT_TARGET]

    return target_list
