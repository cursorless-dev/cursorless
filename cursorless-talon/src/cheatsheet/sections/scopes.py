from ..get_list import get_lists


def get_scopes():
    return {
        **get_lists(
            ["scope_type", "subtoken_scope_type", "head_tail"],
            {"argumentOrParameter": "Argument"},
        ),
        "<P>": "Paired delimiter",
    }
