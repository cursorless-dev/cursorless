from talon import Context, Module

from ..paired_delimiter import paired_delimiters_map

mod = Module()
ctx = Context()


mod.list(
    "cursorless_delimiter_inclusion",
    desc="Whether to include delimiters in surrounding range",
)

mod.list(
    "cursorless_delimiter_force_direction",
    desc="Can be used to force an ambiguous delimiter to extend in one direction",
)
ctx.lists["user.cursorless_delimiter_force_direction"] = [
    "left",
    "right",
]

# NB: This is a hack until we support having inside and outside on arbitrary
# scope types
mod.list(
    "cursorless_surrounding_pair_scope_type",
    desc="Scope types that can function as surrounding pairs",
)


@mod.capture(
    rule=(
        "[{user.cursorless_delimiter_inclusion}] [{user.cursorless_delimiter_force_direction}] <user.cursorless_surrounding_pair_scope_type> | "
        "{user.cursorless_delimiter_inclusion} [{user.cursorless_delimiter_force_direction}]"
    )
)
def cursorless_surrounding_pair(m) -> str:
    """Surrounding pair modifier"""
    try:
        surrounding_pair_scope_type = m.cursorless_surrounding_pair_scope_type
    except AttributeError:
        surrounding_pair_scope_type = "any"

    modifier = {
        "type": "surroundingPair",
        "delimiter": surrounding_pair_scope_type,
    }

    try:
        modifier["delimiterInclusion"] = m.cursorless_delimiter_inclusion
    except AttributeError:
        pass

    try:
        modifier["forceDirection"] = m.cursorless_delimiter_force_direction
    except AttributeError:
        pass

    return {
        "modifier": modifier,
    }


@mod.capture(
    rule=(
        "<user.cursorless_selectable_paired_delimiter> |"
        "{user.cursorless_surrounding_pair_scope_type}"
    )
)
def cursorless_surrounding_pair_scope_type(m) -> str:
    """Surrounding pair scope type"""
    try:
        return m.cursorless_surrounding_pair_scope_type
    except AttributeError:
        return paired_delimiters_map[
            m.cursorless_selectable_paired_delimiter
        ].cursorlessIdentifier
