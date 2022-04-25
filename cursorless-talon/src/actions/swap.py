from talon import Module

from ..primitive_target import BASE_TARGET

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
def cursorless_swap_targets(m) -> list[dict]:
    target_list = m.cursorless_target_list

    if len(target_list) == 1:
        target_list = [BASE_TARGET] + target_list

    return target_list
