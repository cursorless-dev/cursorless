from ..get_list import get_raw_list


def get_compound_targets():
    include_both_term = next(
        spoken_form
        for spoken_form, value in get_raw_list("range_connective").items()
        if value == "rangeInclusive"
    )
    list_connective_term = next(
        spoken_form
        for spoken_form, value in get_raw_list("list_connective").items()
        if value == "listConnective"
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
        {
            "id": "rangeInclusive",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"<T1> {include_both_term} <T2>",
                    "description": "T1 through T2",
                },
                {
                    "spokenForm": f"{include_both_term} <T>",
                    "description": "S through T",
                },
            ],
        },
    ]
