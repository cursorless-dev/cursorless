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
        "callAsFunction",
        "wrapWithPairedDelimiter",
        "rewrap",
        "pasteFromClipboard",
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

    return [
        *make_dict_readable(
            "action",
            simple_actions,
            {
                "editNewLineAfter": "Edit new line/scope after",
                "editNewLineBefore": "Edit new line/scope before",
            },
        ),
        {
            "id": "replaceWithTarget",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"{complex_actions['replaceWithTarget']} <target> <destination>",
                    "description": "Copy <target> to <destination>",
                },
                {
                    "spokenForm": f"{complex_actions['replaceWithTarget']} <target>",
                    "description": "Insert copy of <target> at cursor",
                },
            ],
        },
        {
            "id": "pasteFromClipboard",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"{complex_actions['pasteFromClipboard']} <destination>",
                    "description": "Paste from clipboard at <destination>",
                }
            ],
        },
        {
            "id": "moveToTarget",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"{complex_actions['moveToTarget']} <target> <destination>",
                    "description": "Move <target> to <destination>",
                },
                {
                    "spokenForm": f"{complex_actions['moveToTarget']} <target>",
                    "description": "Move <target> to cursor position",
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
            "id": "callAsFunction",
            "type": "action",
            "variations": [
                {
                    "spokenForm": f"{complex_actions['callAsFunction']} <target>",
                    "description": "Call <target> on selection",
                },
                {
                    "spokenForm": f"{complex_actions['callAsFunction']} <target 1> on <target 2>",
                    "description": "Call <target 1> on <target 2>",
                },
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
