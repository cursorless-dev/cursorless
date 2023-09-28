from ..get_list import get_lists


def get_scopes():
    return get_lists(
        ["scope_type"],
        "scopeType",
        {
            "argumentOrParameter": "Argument",
            "boundedNonWhitespaceSequence": "Non whitespace sequence stopped by surrounding pair delimeters",
        },
    )
