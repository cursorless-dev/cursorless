from talon import Context, Module

from .modifiers.position import construct_positional_modifier

mod = Module()
ctx = Context()

mod.list(
    "cursorless_positional_connective",
    desc='Connectives used to separate source and destination targets that indicate position, eg "before" or "after"',
)

ctx.lists["self.cursorless_positional_connective"] = {
    "before": "before",
    "after": "after",
}


@mod.capture(
    rule=(
        "({user.cursorless_positional_connective} | {user.cursorless_source_destination_connective}) "
        "<user.cursorless_target>"
    )
)
def cursorless_positional_target(m) -> list[dict]:
    target = m.cursorless_target
    try:
        modifier = construct_positional_modifier(m.cursorless_positional_connective)
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
            "anchor": update_first_primitive_target(target["anchor"], modifier),
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
