mode: command
mode: user.cursorless_spoken_form_test
tag: user.cursorless
and tag: user.cursorless_use_community_snippets
-

# These snippets are defined in community
{user.snippet_wrapper} {user.cursorless_wrap_action} <user.cursorless_target>:
    user.wrap_with_snippet_by_name(snippet_wrapper, cursorless_target)
