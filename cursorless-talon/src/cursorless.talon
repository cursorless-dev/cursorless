mode: command
mode: user.cursorless_spoken_form_test
tag: user.cursorless
-

<user.cursorless_action_or_ide_command> <user.cursorless_target>:
    user.cursorless_action_or_ide_command(cursorless_action_or_ide_command, cursorless_target)

{user.cursorless_positional_action} <user.cursorless_positional_target>:
    user.cursorless_single_target_command(cursorless_positional_action, cursorless_positional_target)

{user.cursorless_swap_action} <user.cursorless_swap_targets>:
    user.cursorless_multiple_target_command(cursorless_swap_action, cursorless_swap_targets)

{user.cursorless_move_bring_action} <user.cursorless_move_bring_targets>:
    user.cursorless_multiple_target_command(cursorless_move_bring_action, cursorless_move_bring_targets)

{user.cursorless_reformat_action} <user.formatters> at <user.cursorless_target>:
    user.cursorless_reformat(cursorless_target, formatters)

<user.cursorless_wrapper> {user.cursorless_wrap_action} <user.cursorless_target>:
    user.cursorless_wrap(cursorless_wrap_action, cursorless_target, cursorless_wrapper)

{user.cursorless_homophone} settings: user.cursorless_show_settings_in_ide()

{user.cursorless_show_scope_visualizer} <user.cursorless_scope_type> [{user.cursorless_visualization_type}]:
    user.private_cursorless_show_scope_visualizer(cursorless_scope_type, cursorless_visualization_type or "content")
{user.cursorless_hide_scope_visualizer}:
    user.private_cursorless_hide_scope_visualizer()
