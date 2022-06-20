from talon import Module

head_tail_modifiers = {
    "head": "extendThroughStartOf",
    "tail": "extendThroughEndOf",
}

mod = Module()

mod.list(
    "cursorless_head_tail_modifier",
    desc="Cursorless head and tail modifiers",
)


@mod.capture(rule="{user.cursorless_head_tail_modifier} <user.cursorless_modifier>*")
def cursorless_head_tail_modifier(m) -> dict[str, str]:
    """Cursorless head and tail modifier"""
    result = {
        "type": m.cursorless_head_tail_modifier,
    }
    try:
        result["modifiers"] = m.cursorless_modifier_list
    except AttributeError:
        pass
    return result
