from ...modifiers.containing_scope import SCOPE_LIST_NAMES
from ..get_list import get_lists


def get_scopes():
    return {
        **get_lists(
            SCOPE_LIST_NAMES,
            {"argumentOrParameter": "Argument"},
        ),
        "<P>": "Paired delimiter",
    }
