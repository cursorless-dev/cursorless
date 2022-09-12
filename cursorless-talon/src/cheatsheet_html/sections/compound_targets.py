from ..get_list import get_raw_list

FORMATTERS = {
    "rangeExclusive": lambda start, end: f"between {start} and {end}",
    "rangeInclusive": lambda start, end: f"{start} through {end}",
    "rangeExcludingStart": lambda start, end: f"end of {start} through {end}",
    "rangeExcludingEnd": lambda start, end: f"{start} until start of {end}",
    "verticalRange": lambda start, end: f"{start} vertically through {end}",
}


def get_compound_targets():
    list_connective_term = next(
        spoken_form
        for spoken_form, value in get_raw_list("list_connective").items()
        if value == "listConnective"
    )
    vertical_range_term = next(
        spoken_form
        for spoken_form, value in get_raw_list("range_type").items()
        if value == "verticalRange"
    )

    return [
        {
            "id": "listConnective",
            "type": "compoundTargetConnective",
            "variations": [
                {
                    "spokenForm": f"<T1> {list_connective_term} <T2>",
                    "description": "T1 and T2",
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
                "spokenForm": f"<T1> {spoken_form} <T2>",
                "description": formatter("T1", "T2"),
            },
            {
                "spokenForm": f"{spoken_form} <T>",
                "description": formatter("S", "T"),
            },
        ],
    }
