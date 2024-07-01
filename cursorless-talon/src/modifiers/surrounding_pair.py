from typing import Any

from talon import Context, Module

mod = Module()
ctx = Context()


mod.list(
    "cursorless_delimiter_force_direction",
    desc="Can be used to force an ambiguous delimiter to extend in one direction",
)
# FIXME: Remove type ignore once Talon supports list types
# See https://github.com/talonvoice/talon/issues/654
ctx.lists["user.cursorless_delimiter_force_direction"] = [  # pyright: ignore [reportArgumentType]
    "left",
    "right",
]

mod.list(
    "cursorless_surrounding_pair_scope_type",
    desc="Scope types that can function as surrounding pairs",
)


@mod.capture(
    rule=(
        "<user.cursorless_selectable_paired_delimiter> |"
        "{user.cursorless_surrounding_pair_scope_type}"
    )
)
def cursorless_surrounding_pair_scope_type(m) -> dict[str, Any]:
    """Surrounding pair scope type"""

    try:
        delimiter = m.cursorless_surrounding_pair_scope_type
    except AttributeError:
        delimiter = m.cursorless_selectable_paired_delimiter

    return {
        "type": "surroundingPair",
        "delimiter": delimiter,
    }
