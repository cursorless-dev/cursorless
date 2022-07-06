from ...actions.actions import ACTION_LIST_NAMES
from ..get_list import get_raw_list, make_dict_readable


def get_actions():
    all_actions = {}
    for name in ACTION_LIST_NAMES:
        all_actions.update(get_raw_list(name))

    multiple_target_action_names = [
        "replaceWithTarget",
        "moveToTarget",
        "swapTargets",
        "applyFormatter",
        "wrapWithPairedDelimiter",
        "rewrap",
    ]
    simple_actions = {
        f"{key} <T>": value
        for key, value in all_actions.items()
        if value not in multiple_target_action_names
    }
    complex_actions = {
        value: key
        for key, value in all_actions.items()
        if value in multiple_target_action_names
    }

    swap_connective = list(get_raw_list("swap_connective").keys())[0]
    source_destination_connective = list(
        get_raw_list("source_destination_connective").keys()
    )[0]

    return [
        *make_dict_readable(
            "action",
            simple_actions,
            {
                "callAsFunction": "Call T on S",
            },
        ),
        {
            "identifier": "replaceWithTarget",
            "type": "action",
            "spokenForms": [
                {
                    "spokenForm": f"{complex_actions['replaceWithTarget']} <T1> {source_destination_connective} <T2>",
                    "description": "Replace T2 with T1",
                },
                {
                    "spokenForm": f"{complex_actions['replaceWithTarget']} <T>",
                    "description": "Replace S with T",
                },
            ],
        },
        {
            "identifier": "moveToTarget",
            "type": "action",
            "spokenForms": [
                {
                    "spokenForm": f"{complex_actions['moveToTarget']} <T1> {source_destination_connective} <T2>",
                    "description": "Move T1 to T2",
                },
                {
                    "spokenForm": f"{complex_actions['moveToTarget']} <T>",
                    "description": "Move T to S",
                },
            ],
        },
        {
            "identifier": "swapTargets",
            "type": "action",
            "spokenForms": [
                {
                    "spokenForm": f"{complex_actions['swapTargets']} <T1> {swap_connective} <T2>",
                    "description": "Swap T1 with T2",
                },
                {
                    "spokenForm": f"{complex_actions['swapTargets']} {swap_connective} <T>",
                    "description": "Swap S with T",
                },
            ],
        },
        {
            "identifier": "applyFormatter",
            "type": "action",
            "spokenForms": [
                {
                    "spokenForm": f"{complex_actions['applyFormatter']} <F> at <T>",
                    "description": "Reformat T as F",
                }
            ],
        },
        {
            "identifier": "wrapWithPairedDelimiter",
            "type": "action",
            "spokenForms": [
                {
                    "spokenForm": f"<P> {complex_actions['wrapWithPairedDelimiter']} <T>",
                    "description": "Wrap T with P",
                }
            ],
        },
        {
            "identifier": "rewrap",
            "type": "action",
            "spokenForms": [
                {
                    "spokenForm": f"<P> {complex_actions['rewrap']} <T>",
                    "description": "Rewrap T with P",
                }
            ],
        },
    ]
