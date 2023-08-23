mode: user.cursorless_spoken_form_test
tag: user.cursorless
-

# For testing our public api
test api command <user.cursorless_target>:
    user.cursorless_command("setSelection", cursorless_target)
test api command bring <user.cursorless_target>:
    user.cursorless_command("replaceWithTarget", cursorless_target)
test api insert snippet:
    user.cursorless_insert_snippet("Hello, $foo!  My name is $bar!")
test api insert snippet by name:
    user.cursorless_insert_snippet_by_name("functionDeclaration")
test api wrap with snippet <user.cursorless_target>:
    user.cursorless_wrap_with_snippet("Hello, $foo!  My name is $bar!", cursorless_target, "foo", "statement")
test api wrap with snippet by name <user.cursorless_target>:
    user.cursorless_wrap_with_snippet_by_name("functionDeclaration", "body", cursorless_target)
