tag: user.cursorless
-

{user.cursorless_homophone} record:
    user.run_rpc_command("cursorless.recordTestCase")
{user.cursorless_homophone} pause:
    user.run_rpc_command("cursorless.pauseRecording")
{user.cursorless_homophone} resume:
    user.run_rpc_command("cursorless.resumeRecording")

{user.cursorless_homophone} record navigation:
    user.private_cursorless_record_navigation_test()
{user.cursorless_homophone} record error:
    user.private_cursorless_record_error_test()
{user.cursorless_homophone} record highlights:
    user.private_cursorless_record_highlights_test()
{user.cursorless_homophone} record that mark:
    user.private_cursorless_record_that_mark_test()

{user.cursorless_homophone} update cheatsheet:
    user.private_cursorless_cheat_sheet_update_json()

test snippet make <user.cursorless_target>:
    user.private_cursorless_makes_snippet_test(cursorless_target)
