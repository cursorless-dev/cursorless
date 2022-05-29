from talon import Module

from ..primitive_target import IMPLICIT_TARGET

mod = Module()


mod.list("cursorless_move_bring_action", desc="Cursorless move or bring actions")


@mod.capture(rule="<user.cursorless_target> [<user.cursorless_positional_target>]")
def cursorless_move_bring_targets(m) -> list[dict]:
    target_list = m.cursorless_target_list

    try:
        target_list += [m.cursorless_positional_target]
    except AttributeError:
        target_list += [IMPLICIT_TARGET.copy()]

    return target_list
