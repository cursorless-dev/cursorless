from ..get_list import get_raw_list, get_spoken_form_from_list

FORMATTERS = {
    "rangeExclusive": lambda start, end: f"between {start} and {end}",
    "rangeInclusive": lambda start, end: f"{start} through {end}",
    "rangeExcludingStart": lambda start, end: f"end of {start} through {end}",
    "rangeExcludingEnd": lambda start, end: f"{start} until start of {end}",
    "verticalRange": lambda start, end: f"{start} vertically through {end}",
}


def get_compound_targets():
    list_connective_term = get_spoken_form_from_list(
        "list_connective", "listConnective"
    )
    vertical_range_term = get_spoken_form_from_list("range_type", "verticalRange")

    return [
        {
            "id": "listConnective",
            "type": "compoundTargetConnective",
            "variations": [
                {
                    "spokenForm": f"<target 1> {list_connective_term} <target 2>",
                    "description": "<target 1> and <target 2>",
                },
            ],
        },
        *[
            get_entry(spoken_form, id)
            for spoken_form, id in get_raw_list("range_connective").items()
        ],
        get_entry(vertical_range_term, "verticalRange"),
    ]


def get_entry(spoken_form, id):
    formatter = FORMATTERS[id]

    return {
        "id": id,
        "type": "compoundTargetConnective",
        "variations": [
            {
                "spokenForm": f"<target 1> {spoken_form} <target 2>",
                "description": formatter("<target 1>", "<target 2>"),
            },
            {
                "spokenForm": f"{spoken_form} <target>",
                "description": formatter("selection", "<target>"),
            },
        ],
    }
