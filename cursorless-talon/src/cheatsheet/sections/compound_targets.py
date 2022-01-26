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
    compound_targets = {
        f"<T1> {list_connective_term} <T2>": "T1 and T2",
        f"<T1> {include_both_term} <T2>": "T1 through T2",
        f"{include_both_term} <T>": "S through T",
    }

    return compound_targets
