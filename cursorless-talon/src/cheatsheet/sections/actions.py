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
        f"{key} <target>": value
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
                "callAsFunction": "Call <target> on selection",
            },
        ),
        {
            "id": "replaceWithTarget",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"{complex_actions['replaceWithTarget']} <target 1> {source_destination_connective} <target 2>",
                    "description": "Replace <target 2> with <target 1>",
                },
                {
                    "spokenForm": f"{complex_actions['replaceWithTarget']} <target>",
                    "description": "Replace selection with <target>",
                },
            ],
        },
        {
            "id": "moveToTarget",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"{complex_actions['moveToTarget']} <target 1> {source_destination_connective} <target 2>",
                    "description": "Move <target 1> to <target 2>",
                },
                {
                    "spokenForm": f"{complex_actions['moveToTarget']} <target>",
                    "description": "Move <target> to selection",
                },
            ],
        },
        {
            "id": "swapTargets",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"{complex_actions['swapTargets']} <target 1> {swap_connective} <target 2>",
                    "description": "Swap <target 1> with <target 2>",
                },
                {
                    "spokenForm": f"{complex_actions['swapTargets']} {swap_connective} <target>",
                    "description": "Swap selection with <target>",
                },
            ],
        },
        {
            "id": "applyFormatter",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"{complex_actions['applyFormatter']} <formatter> at <target>",
                    "description": "Reformat <target> as <formatter>",
                }
            ],
        },
        {
            "id": "wrapWithPairedDelimiter",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"<pair> {complex_actions['wrapWithPairedDelimiter']} <target>",
                    "description": "Wrap <target> with <pair>",
                }
            ],
        },
        {
            "id": "rewrap",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"<pair> {complex_actions['rewrap']} <target>",
                    "description": "Rewrap <target> with <pair>",
                }
            ],
        },
    ]
