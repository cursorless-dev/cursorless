app: vscode
tag: user.cursorless_experimental_snippets
-

{user.cursorless_insert_snippet_action} <user.cursorless_insertion_snippet>:
    user.cursorless_this_command(cursorless_insert_snippet_action, cursorless_insertion_snippet)

{user.cursorless_insert_snippet_action} <user.cursorless_insertion_snippet> <user.cursorless_target>:
    user.cursorless_single_target_command(cursorless_insert_snippet_action, cursorless_target, cursorless_insertion_snippet)

{user.cursorless_insert_snippet_action} {user.cursorless_insertion_snippet_single_phrase} <user.text> [halt]:
    user.cursorless_insert_snippet_with_phrase(cursorless_insert_snippet_action, cursorless_insertion_snippet_single_phrase, text)