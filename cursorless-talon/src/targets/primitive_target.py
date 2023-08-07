from talon import Module

from .target_types import PrimitiveTarget

mod = Module()


@mod.capture(
    rule=(
        "<user.cursorless_modifier>+ [<user.cursorless_mark>] | <user.cursorless_mark>"
    )
)
def cursorless_primitive_target(m) -> PrimitiveTarget:
    return PrimitiveTarget(
        getattr(m, "cursorless_mark", None),
        getattr(m, "cursorless_modifier_list", None),
    )
