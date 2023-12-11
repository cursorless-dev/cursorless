from ..get_list import get_lists, get_raw_list


def get_scopes():
    complex_scopes = get_raw_list("glyph_scope_type")
    return [
        *get_lists(
            ["scope_type"],
            "scopeType",
            {
                "argumentOrParameter": "Argument",
                "boundedNonWhitespaceSequence": "Non whitespace sequence stopped by surrounding pair delimeters",
            },
        ),
        {
            "id": "glyph",
            "type": "scopeType",
            "variations": [
                {
                    "spokenForm": f"{complex_scopes['glyph']} <character>",
                    "description": "Instance of single character <character>",
                },
            ],
        },
    ]
