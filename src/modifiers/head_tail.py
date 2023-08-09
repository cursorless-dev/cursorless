from talon import Module

mod = Module()

mod.list(
    "cursorless_head_tail_modifier",
    desc="Cursorless head and tail modifiers",
)


@mod.capture(
    rule=(
        "{user.cursorless_head_tail_modifier} "
        "[<user.cursorless_interior_modifier>] "
        "[<user.cursorless_head_tail_swallowed_modifier>]"
    )
)
def cursorless_head_tail_modifier(m) -> dict[str, str]:
    """Cursorless head and tail modifier"""
    modifiers = []

    try:
        modifiers.append(m.cursorless_interior_modifier)
    except AttributeError:
        pass

    try:
        modifiers.append(m.cursorless_head_tail_swallowed_modifier)
    except AttributeError:
        pass

    result = {
        "type": m.cursorless_head_tail_modifier,
    }

    if modifiers:
        result["modifiers"] = modifiers

    return result
