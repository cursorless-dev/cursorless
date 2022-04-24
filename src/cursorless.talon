app: vscode
-

<user.cursorless_action_or_vscode_command> <user.cursorless_target>:
    user.cursorless_action_or_vscode_command(cursorless_action_or_vscode_command, cursorless_target)

{user.cursorless_swap_action} <user.cursorless_swap_targets>:
    user.cursorless_multiple_target_command(cursorless_swap_action, cursorless_swap_targets)

{user.cursorless_move_bring_action} <user.cursorless_move_bring_targets>:
    user.cursorless_multiple_target_command(cursorless_move_bring_action, cursorless_move_bring_targets)

{user.cursorless_reformat_action} <user.formatters> at <user.cursorless_target>:
    user.cursorless_reformat(cursorless_target, formatters)

<user.cursorless_wrapper> {user.cursorless_wrap_action} <user.cursorless_target>:
    user.cursorless_wrap(cursorless_wrap_action, cursorless_target, cursorless_wrapper)

cursorless help:           user.cursorless_cheat_sheet_toggle()
cursorless instructions:   user.cursorless_open_instructions()
