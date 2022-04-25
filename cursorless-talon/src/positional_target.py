from talon import Module

mod = Module()


@mod.capture(rule=("{user.cursorless_positional_connective} <user.cursorless_target>"))
def cursorless_positional_target(m) -> list[dict]:
    return process_positional_connective(
        m.cursorless_positional_connective, m.cursorless_target
    )


def process_positional_connective(cursorless_positional_connective: str, target: dict):
    if cursorless_positional_connective == "afterConnective":
        return update_first_primitive_target(target, {"position": "after"})
    elif cursorless_positional_connective == "beforeConnective":
        return update_first_primitive_target(target, {"position": "before"})

    return target


def update_first_primitive_target(target: dict, fields: dict):
    if target["type"] == "primitive":
        return {**target, **fields}
    elif target["type"] == "range":
        return {
            **target,
            "start": update_first_primitive_target(target["start"], fields),
        }
    else:
        elements = target["elements"]

        return {
            **target,
            "elements": [
                update_first_primitive_target(elements[0], fields),
                *elements[1:],
            ],
        }
