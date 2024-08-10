from talon import Module

from .target_types import PrimitiveTarget

mod = Module()


@mod.capture(
    rule=(
        "<user.cursorless_modifier>+ [<user.cursorless_mark>] | <user.cursorless_mark>"
    )
)
def cursorless_primitive_target(m) -> PrimitiveTarget:
    mark = getattr(m, "cursorless_mark", None)
    modifiers = getattr(m, "cursorless_modifier_list", None)

    # for grammar performance reasons, the literal modifier is exposed to Talon as a mark,
    # but is converted to a modifier in the engine.
    if mark is not None and mark["type"] == "literal":
        if modifiers is None:
            modifiers = []
        modifiers.append(mark["modifier"])
        mark = None

    return PrimitiveTarget(mark, modifiers)
