from talon import Module

mod = Module()


@mod.capture(rule="{user.cursorless_head_tail_modifier} [<user.cursorless_modifier>]")
def cursorless_head_tail_modifier(m) -> dict[str, str]:
    """Cursorless head and tail modifier"""
    result = {
        "type": m.cursorless_head_tail_modifier,
    }
    try:
        result["modifier"] = m.cursorless_modifier
    except AttributeError:
        pass
    return result
