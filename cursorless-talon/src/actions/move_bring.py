from talon import Module

from ..primitive_target import create_implicit_target

mod = Module()


mod.list("cursorless_move_bring_action", desc="Cursorless move or bring actions")


@mod.capture(rule="<user.cursorless_target> [<user.cursorless_positional_target>]")
def cursorless_move_bring_targets(m) -> list[dict]:
    target_list = m.cursorless_target_list

    try:
        target_list += [m.cursorless_positional_target]
    except AttributeError:
        target_list += [create_implicit_target()]

    return target_list
