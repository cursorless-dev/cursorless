tag: user.cursorless
-

<user.cursorless_action_or_ide_command> <user.cursorless_target>:
    user.private_cursorless_action_or_ide_command(cursorless_action_or_ide_command, cursorless_target)

{user.cursorless_bring_move_action} <user.cursorless_bring_move_targets>:
    user.private_cursorless_bring_move(cursorless_bring_move_action, cursorless_bring_move_targets)

{user.cursorless_swap_action} <user.cursorless_swap_targets>:
    user.private_cursorles_swap(cursorless_swap_targets)

{user.cursorless_paste_action} <user.cursorless_destination>:
    user.private_cursorless_paste(cursorless_destination)

{user.cursorless_reformat_action} <user.formatters> at <user.cursorless_target>:
    user.private_cursorless_reformat(cursorless_target, formatters)

<user.cursorless_wrapper_paired_delimiter> {user.cursorless_wrap_action} <user.cursorless_target>:
    user.private_cursorless_wrap_paired_delimiter(cursorless_wrap_action, cursorless_wrapper_paired_delimiter)

{user.cursorless_wrapper_snippet} {user.cursorless_wrap_action} <user.cursorless_target>:
    user.private_cursorless_wrap_snippet(cursorless_wrap_action, cursorless_target, cursorless_wrapper_snippet)

{user.cursorless_insert_snippet_action} <user.cursorless_insertion_snippet>:
    user.private_cursorless_insert_snippet(cursorless_insertion_snippet)

{user.cursorless_insert_snippet_action} {user.cursorless_insertion_snippet_single_phrase} <user.text> [{user.cursorless_phrase_terminator}]:
    user.private_cursorless_insert_snippet_with_phrase(cursorless_insertion_snippet_single_phrase, text)

{user.cursorless_homophone} settings:
    user.private_cursorless_show_settings_in_ide()
