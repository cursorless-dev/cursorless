from ..get_list import get_raw_list, get_list, make_dict_readable

def get_special_marks():
    line_direction_marks = make_dict_readable(
        "mark",
        {
            f"{key} <number>": value
            for key, value in get_raw_list("line_direction").items()
        }
    )

    return [
        *get_list("special_mark", "mark"),
        *line_direction_marks
    ]
