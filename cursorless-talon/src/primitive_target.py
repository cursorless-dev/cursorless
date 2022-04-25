from talon import Module

mod = Module()

BASE_TARGET = {"type": "primitive"}
IMPLICIT_TARGET = {"type": "primitive", "isImplicit": True}


modifiers = [
    "<user.cursorless_position>",  # before, end of
    "<user.cursorless_selection_type>",  # token, line, file
    "<user.cursorless_head_tail>",  # head, tail
    "<user.cursorless_containing_scope>",  # funk, state, class
    "<user.cursorless_subtoken_scope>",  # first past second word
    "<user.cursorless_surrounding_pair>",  # matching/pair [curly, round]
    "<user.cursorless_to_raw_selection>",  # just
    # "<user.cursorless_matching_paired_delimiter>",  # matching
]


@mod.capture(rule="|".join(modifiers))
def cursorless_modifier(m) -> str:
    """Cursorless modifier"""
    return m[0]


@mod.capture(
    rule="<user.cursorless_modifier>+ [<user.cursorless_mark>] | <user.cursorless_mark>"
)
def cursorless_primitive_target(m) -> str:
    """Supported extents for cursorless navigation"""
    result = BASE_TARGET.copy()
    for capture in m:
        result.update(capture)
    return result
