mode: user.cursorless_spoken_form_test
tag: user.cursorless
-

# For testing our public api
test api command <user.cursorless_target>:
    user.cursorless_command("setSelection", cursorless_target)
test api command bring <user.cursorless_target>:
    user.cursorless_command("replaceWithTarget", cursorless_target)
test api get text <user.cursorless_target>:
    user.cursorless_get_text(cursorless_target)
test api get text list on <user.cursorless_target>:
    user.cursorless_get_text_list(cursorless_target)
test api get text hide decorations <user.cursorless_target>:
    user.cursorless_get_text(cursorless_target, true)
test api get text hide decorations list on <user.cursorless_target>:
    user.cursorless_get_text_list(cursorless_target, true)

test api insert <user.word> <user.cursorless_destination>:
    user.cursorless_insert(cursorless_destination, word)
test api insert <user.word> and <user.word> <user.cursorless_destination>:
    user.cursorless_insert(cursorless_destination, word_list)

test api insert snippet:
    user.cursorless_insert_snippet("Hello, $foo!  My name is $bar!")
test api insert snippet <user.cursorless_destination> :
    user.cursorless_insert_snippet("Hello, $foo!  My name is $bar!", cursorless_destination, "statement")
test api insert snippet by name:
    user.cursorless_insert_snippet_by_name("functionDeclaration")
test api wrap with snippet <user.cursorless_target>:
    user.cursorless_wrap_with_snippet("Hello, $foo!  My name is $bar!", cursorless_target, "foo", "statement")
test api wrap with snippet by name <user.cursorless_target>:
    user.cursorless_wrap_with_snippet_by_name("functionDeclaration", "body", cursorless_target)
test api extract decorated marks <user.cursorless_target>:
    user.private_cursorless_test_extract_decorated_marks(cursorless_target)
test api alternate highlight nothing:
    user.private_cursorless_test_alternate_highlight_nothing()

test api parsed: user.cursorless_custom_command("chuck block")
test api parsed <user.cursorless_target>:
    user.cursorless_custom_command("chuck block $1", cursorless_target)
test api parsed <user.cursorless_target> plus <user.cursorless_target>:
    user.cursorless_custom_command("bring block $1 after $2", cursorless_target_1, cursorless_target_2)
