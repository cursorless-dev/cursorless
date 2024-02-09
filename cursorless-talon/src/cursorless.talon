mode: command
mode: user.cursorless_spoken_form_test
tag: user.cursorless
-

<user.cursorless_action_or_ide_command> <user.cursorless_target>:
    user.private_cursorless_action_or_ide_command(cursorless_action_or_ide_command, cursorless_target)

{user.cursorless_bring_move_action} <user.cursorless_bring_move_targets>:
    user.private_cursorless_bring_move(cursorless_bring_move_action, cursorless_bring_move_targets)

{user.cursorless_swap_action} <user.cursorless_swap_targets>:
    user.private_cursorless_swap(cursorless_swap_targets)

{user.cursorless_paste_action} <user.cursorless_destination>:
    user.private_cursorless_paste(cursorless_destination)

{user.cursorless_reformat_action} <user.formatters> at <user.cursorless_target>:
    user.private_cursorless_reformat(cursorless_target, formatters)

{user.cursorless_call_action} <user.cursorless_target> on <user.cursorless_target>:
    user.private_cursorless_call(cursorless_target_1, cursorless_target_2)

<user.cursorless_wrapper_paired_delimiter> {user.cursorless_wrap_action} <user.cursorless_target>:
    user.private_cursorless_wrap_with_paired_delimiter(cursorless_wrap_action, cursorless_target, cursorless_wrapper_paired_delimiter)

{user.cursorless_insert_snippet_action} <user.cursorless_insertion_snippet>:
    user.private_cursorless_insert_snippet(cursorless_insertion_snippet)

{user.cursorless_insert_snippet_action} {user.cursorless_insertion_snippet_single_phrase} <user.text> [{user.cursorless_phrase_terminator}]:
    user.private_cursorless_insert_snippet_with_phrase(cursorless_insertion_snippet_single_phrase, text)

{user.cursorless_wrapper_snippet} {user.cursorless_wrap_action} <user.cursorless_target>:
    user.private_cursorless_wrap_with_snippet(cursorless_wrap_action, cursorless_target, cursorless_wrapper_snippet)

{user.cursorless_show_scope_visualizer} <user.cursorless_scope_type> [{user.cursorless_visualization_type}]:
    user.private_cursorless_show_scope_visualizer(cursorless_scope_type, cursorless_visualization_type or "content")
{user.cursorless_hide_scope_visualizer}:
    user.private_cursorless_hide_scope_visualizer()

{user.cursorless_homophone} settings:
    user.private_cursorless_show_settings_in_ide()

bar {user.cursorless_homophone}:
    user.private_cursorless_show_sidebar()

{user.cursorless_homophone} stats:
    user.private_cursorless_show_command_statistics()
