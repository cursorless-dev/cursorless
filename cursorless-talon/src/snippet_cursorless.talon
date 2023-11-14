mode: command
mode: user.cursorless_spoken_form_test
tag: user.cursorless
and not tag: user.cursorless_use_community_snippets
-

{user.cursorless_insert_snippet_action} <user.cursorless_insertion_snippet>:
    user.private_cursorless_insert_snippet(cursorless_insertion_snippet)

{user.cursorless_insert_snippet_action} {user.cursorless_insertion_snippet_single_phrase} <user.text> [{user.cursorless_phrase_terminator}]:
    user.private_cursorless_insert_snippet_with_phrase(cursorless_insertion_snippet_single_phrase, text)

{user.cursorless_wrapper_snippet} {user.cursorless_wrap_action} <user.cursorless_target>:
    user.private_cursorless_wrap_with_snippet(cursorless_wrap_action, cursorless_target, cursorless_wrapper_snippet)
