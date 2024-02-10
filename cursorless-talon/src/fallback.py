from talon import actions

action_callbacks = {
    "getText": lambda: [actions.edit.selected_text()],
    "setSelection": actions.skip,
    "copyToClipboard": actions.edit.copy,
    "cutToClipboard": actions.edit.cut,
    "pasteFromClipboard": actions.edit.paste,
    "clearAndSetSelection": actions.edit.delete,
    "remove": actions.edit.delete,
    "applyFormatter": actions.user.reformat_selection,
    "editNewLineBefore": actions.edit.line_insert_up,
    "editNewLineAfter": actions.edit.line_insert_down,
    "nextHomophone": actions.user.homophones_cycle_selected,
    # "replaceWithTarget": replace_with_target,
}

scope_callbacks = {
    "cursor": actions.skip,
    "extendThroughStartOf.line": actions.user.select_line_start,
    "extendThroughEndOf.line": actions.user.select_line_end,
    "containing.document": actions.edit.select_all,
    "containing.paragraph": actions.edit.select_paragraph,
    "containing.line": actions.edit.select_line,
    "containing.token": actions.edit.select_word,
}


def callAsFunction(callee: str):
    actions.insert(f"{callee}()")
    actions.edit.left()


def perform_fallback(fallback: dict):
    try:
        scope_callback = get_scope_callback(fallback)
        action_callback = get_action_callback(fallback)
        scope_callback()
        return action_callback()
    except ValueError as ex:
        actions.app.notify(str(ex))


def get_action_callback(fallback: dict):
    action = fallback["action"]

    if action in action_callbacks:
        return action_callbacks[action]

    if action == "insert":
        return lambda: actions.insert(fallback["text"])

    if action == "callAsFunction":
        return lambda: callAsFunction(fallback["callee"])

    if action == "wrapWithPairedDelimiter":
        return lambda: actions.user.delimiters_pair_wrap_selection_with(
            fallback["left"], fallback["right"]
        )

    raise ValueError(f"Unknown Cursorless fallback action: {action}")


def get_scope_callback(fallback: dict):
    if "scope" not in fallback:
        return actions.skip

    scope = fallback["scope"]

    if scope is None:
        return actions.skip

    if scope in scope_callbacks:
        return scope_callbacks[scope]

    raise ValueError(f"Unknown Cursorless fallback scope: {scope}")
