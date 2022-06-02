from talon import Context, Module

from .modifiers.position import POSITION_AFTER, POSITION_BEFORE

mod = Module()
ctx = Context()

mod.list(
    "cursorless_positional_connective",
    desc='Connectives used to separate source and destination targets that indicate position, eg "before" or "after"',
)

positional_connectives = {
    **POSITION_BEFORE,
    **POSITION_AFTER,
}

ctx.lists["self.cursorless_positional_connective"] = positional_connectives.keys()


@mod.capture(
    rule=(
        "({user.cursorless_positional_connective} | {user.cursorless_source_destination_connective}) "
        "<user.cursorless_target>"
    )
)
def cursorless_positional_target(m) -> list[dict]:
    target = m.cursorless_target
    try:
        modifier = positional_connectives[m.cursorless_positional_connective]
        return update_first_primitive_target(target, modifier)
    except AttributeError:
        return target


def update_first_primitive_target(target: dict, modifier: dict):
    if target["type"] == "primitive":
        if "modifiers" not in target:
            target["modifiers"] = []
        target["modifiers"].insert(0, modifier)
        return target
    elif target["type"] == "range":
        return {
            **target,
            "start": update_first_primitive_target(target["start"], modifier),
        }
    else:
        elements = target["elements"]
        return {
            **target,
            "elements": [
                update_first_primitive_target(elements[0], modifier),
                *elements[1:],
            ],
        }
