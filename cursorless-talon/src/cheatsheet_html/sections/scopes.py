from ..get_list import get_lists


def get_scopes():
    return get_lists(
        ["scope_type", "subtoken_scope_type"],
        "scopeType",
        {"argumentOrParameter": "Argument"},
    )
