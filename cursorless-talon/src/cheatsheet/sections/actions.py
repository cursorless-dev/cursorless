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
    positional_connectives = {
        value: key for key, value in get_raw_list("positional_connective").items()
    }

    make_dict_readable(
        simple_actions,
        {
            "callAsFunction": "Call T on S",
        },
    )
    return {
        **simple_actions,
        f"{complex_actions['replaceWithTarget']} T1 {positional_connectives['contentConnective']} T2": "Replace T2 with T1",
        f"{complex_actions['replaceWithTarget']} T1 {positional_connectives['afterConnective']} T2": "Copy T2 after T1",
        f"{complex_actions['replaceWithTarget']} T1 {positional_connectives['beforeConnective']} T2": "Copy T2 before T1",
        f"{complex_actions['replaceWithTarget']} T": "Replace S with T",
        f"{complex_actions['moveToTarget']} T1 {positional_connectives['contentConnective']} T2": "Move T1 to T2",
        f"{complex_actions['moveToTarget']} T1 {positional_connectives['afterConnective']} T2": "Move T1 after T2",
        f"{complex_actions['moveToTarget']} T1 {positional_connectives['beforeConnective']} T2": "Move T1 before T2",
        f"{complex_actions['moveToTarget']} T": "Move T to S",
        f"{complex_actions['swapTargets']} <T1> {swap_connective} <T2>": "Swap T1 with T2",
        f"{complex_actions['swapTargets']} {swap_connective} <T>": "Swap S with T",
        f"{complex_actions['applyFormatter']} <F> at <T>": "Reformat T as F",
        f"<P> {complex_actions['wrapWithPairedDelimiter']} <T>": "Wrap T with P",
        f"<P> {complex_actions['rewrap']} <T>": "Rewrap T with P",
    }
