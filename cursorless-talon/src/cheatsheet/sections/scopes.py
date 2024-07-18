from ..get_list import get_lists, get_spoken_form_from_list


def get_scopes():
    glyph_spoken_form = get_spoken_form_from_list("glyph_scope_type", "glyph")
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
                    "spokenForm": f"{glyph_spoken_form} <character>",
                    "description": "Instance of single character <character>",
                },
            ],
        },
    ]
