from ..get_list import get_raw_list, make_dict_readable

MODIFIER_LIST_NAMES = [
    "simple_modifier",
    "interior_modifier",
    "head_tail_modifier",
    "every_modifier",
    "first_modifier",
    "last_modifier",
    "previous_next_modifier",
    "backward_modifier",
]


def get_modifiers():
    all_modifiers = {}
    for name in MODIFIER_LIST_NAMES:
        all_modifiers.update(get_raw_list(name))

    complex_modifier_ids = [
        "extendThroughStartOf",
        "extendThroughEndOf",
        "every",
        "first",
        "last",
        "previous",
        "next",
        "backward",
    ]
    simple_modifiers = {
        key: value
        for key, value in all_modifiers.items()
        if value not in complex_modifier_ids
    }
    complex_modifiers = {
        value: key
        for key, value in all_modifiers.items()
        if value in complex_modifier_ids
    }

    return [
        *make_dict_readable(
            "modifier",
            simple_modifiers,
            {
                "excludeInterior": "Bounding paired delimiters",
                "toRawSelection": "No inference",
                "leading": "Leading delimiter range",
                "trailing": "Trailing delimiter range",
            },
        ),
        {
            "id": "extendThroughStartOf",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": complex_modifiers["extendThroughStartOf"],
                    "description": "Extend through start of line",
                },
                {
                    "spokenForm": f"{complex_modifiers['extendThroughStartOf']} <M>",
                    "description": "Extend through start of <M>",
                },
            ],
        },
        {
            "id": "extendThroughEndOf",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": complex_modifiers["extendThroughEndOf"],
                    "description": "Extend through end of line",
                },
                {
                    "spokenForm": f"{complex_modifiers['extendThroughEndOf']} <M>",
                    "description": "Extend through end of <M>",
                },
            ],
        },
        {
            "id": "every",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": f"{complex_modifiers['every']} <scope>",
                    "description": "Every instance of <scope>",
                },
            ],
        },
        {
            "id": "containingScope",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": f"<scope>",
                    "description": "Containing instance of <scope>",
                },
            ],
        },
        {
            "id": "previous",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": f"{complex_modifiers['previous']} <scope>",
                    "description": "Previous instance of <scope>",
                },
                {
                    "spokenForm": f"<nth> {complex_modifiers['previous']} <scope>",
                    "description": "<nth> previous instance of <scope>",
                },
                {
                    "spokenForm": f"<number> {complex_modifiers['previous']} <scope>s",
                    "description": "<number> previous instances of <scope>",
                },
            ],
        },
        {
            "id": "next",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": f"{complex_modifiers['next']} <scope>",
                    "description": "Next instance of <scope>",
                },
                {
                    "spokenForm": f"<nth> {complex_modifiers['next']} <scope>",
                    "description": "<nth> next instance of <scope>",
                },
                {
                    "spokenForm": f"<number> {complex_modifiers['next']} <scope>s",
                    "description": "<number> next instances of <scope>",
                },
            ],
        },
        {
            "id": "first",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": f"{complex_modifiers['first']} <number> <scope>s",
                    "description": "First <number> instances of <scope>",
                },
            ],
        },
        {
            "id": "last",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": f"{complex_modifiers['last']} <number> <scope>s",
                    "description": "Last <number> instances of <scope>",
                },
            ],
        },
        {
            "id": "relative",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": f"<number> <scope>s",
                    "description": "<number> instances of <scope> forwards",
                },
                {
                    "spokenForm": f"<number> <scope>s {complex_modifiers['backward']}",
                    "description": "<number> instances of <scope> backwards",
                },
            ],
        },
        {
            "id": "ordinal",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": f"<nth> <scope>",
                    "description": "<nth> instance of <scope>",
                },
                {
                    "spokenForm": f"<nth> {complex_modifiers['last']} <scope>",
                    "description": "<nth> instance of <scope> counting from back",
                },
            ],
        },
    ]
