from talon import Module

mod = Module()

mod.list(
    "cursorless_simple_modifier",
    desc="Simple cursorless modifiers that only need to specify their type",
)


@mod.capture(rule="{user.cursorless_simple_modifier}")
def cursorless_simple_modifier(m) -> dict[str, str]:
    """Simple cursorless modifiers that only need to specify their type"""
    return {
        "type": m.cursorless_simple_modifier,
    }


# These are the modifiers that will be "swallowed" by the head/tail modifier.
# For example, saying "head funk" will result in a "head" modifier that will
# select past the start of the function.
# Note that we don't include "inside" here, because that requires slightly
# special treatment to ensure that "head inside round" swallows "inside round"
# rather than just "inside".
head_tail_swallowed_modifiers = [
    "<user.cursorless_simple_modifier>",  # bounds, just, leading, trailing
    "<user.cursorless_simple_scope_modifier>",  # funk, state, class, every funk
    "<user.cursorless_ordinal_scope>",  # first past second word
    "<user.cursorless_relative_scope>",  # next funk, 3 funks
    "<user.cursorless_surrounding_pair>",  # matching/pair [curly, round]
]

modifiers = [
    "<user.cursorless_interior_modifier>",  # inside
    "<user.cursorless_head_tail_modifier>",  # head, tail
    "<user.cursorless_position_modifier>",  # start of, end of
    *head_tail_swallowed_modifiers,
]


@mod.capture(rule="|".join(modifiers))
def cursorless_modifier(m) -> str:
    """Cursorless modifier"""
    return m[0]


@mod.capture(rule="|".join(head_tail_swallowed_modifiers))
def cursorless_head_tail_swallowed_modifier(m) -> str:
    """Cursorless modifier that is swallowed by the head/tail modifier, excluding interior, which requires special treatment"""
    return m[0]
