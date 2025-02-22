from typing import Callable

from ...actions.actions import ACTION_LIST_NAMES
from ..get_list import ListItemDescriptor, get_raw_list, make_dict_readable


def get_actions() -> list[ListItemDescriptor]:
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

    swap_connectives = list(get_raw_list("swap_connective").keys())
    swap_connective = swap_connectives[0] if swap_connectives else None

    items = make_dict_readable(
        "action",
        simple_actions,
        {
            "editNewLineAfter": "Edit new line/scope after",
            "editNewLineBefore": "Edit new line/scope before",
        },
    )

    fixtures: dict[str, list[tuple[Callable, str]]] = {
        "replaceWithTarget": [
            (
                lambda value: f"{value} <target> <destination>",
                "Copy <target> to <destination>",
            ),
            (
                lambda value: f"{value} <target>",
                "Insert copy of <target> at cursor",
            ),
        ],
        "pasteFromClipboard": [
            (
                lambda value: f"{value} <destination>",
                "Paste from clipboard at <destination>",
            )
        ],
        "moveToTarget": [
            (
                lambda value: f"{value} <target> <destination>",
                "Move <target> to <destination>",
            ),
            (
                lambda value: f"{value} <target>",
                "Move <target> to cursor position",
            ),
        ],
        "applyFormatter": [
            (
                lambda value: f"{value} <formatter> at <target>",
                "Reformat <target> as <formatter>",
            )
        ],
        "callAsFunction": [
            (
                lambda value: f"{value} <target>",
                "Call <target> on selection",
            ),
            (
                lambda value: f"{value} <target 1> on <target 2>",
                "Call <target 1> on <target 2>",
            ),
        ],
        "wrapWithPairedDelimiter": [
            (
                lambda value: f"<pair> {value} <target>",
                "Wrap <target> with <pair>",
            )
        ],
        "rewrap": [
            (
                lambda value: f"<pair> {value} <target>",
                "Rewrap <target> with <pair>",
            )
        ],
    }

    if swap_connective:
        fixtures["swapTargets"] = [
            (
                lambda value: f"{value} <target 1> {swap_connective} <target 2>",
                "Swap <target 1> with <target 2>",
            ),
            (
                lambda value: f"{value} {swap_connective} <target>",
                "Swap selection with <target>",
            ),
        ]

    for action_id, variations in fixtures.items():
        if action_id not in complex_actions:
            continue
        action = complex_actions[action_id]
        items.append(
            {
                "id": action_id,
                "type": "action",
                "variations": [
                    {
                        "spokenForm": callback(action),
                        "description": description,
                    }
                    for callback, description in variations
                ],
            }
        )

    return items
