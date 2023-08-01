tag: user.cursorless
-

# Activate this if you want the default Cursorless vocabulary
# tag(): user.cursorless_default_vocabulary

{user.cursorless_homophone} record:
    user.run_rpc_command("cursorless.recordTestCase")
{user.cursorless_homophone} pause:
    user.run_rpc_command("cursorless.pauseRecording")
{user.cursorless_homophone} resume:
    user.run_rpc_command("cursorless.resumeRecording")

{user.cursorless_homophone} record navigation:
    user.cursorless_record_navigation_test()
{user.cursorless_homophone} record error: user.cursorless_record_error_test()
{user.cursorless_homophone} record highlights:
    user.cursorless_record_highlights_test()
{user.cursorless_homophone} record that mark:
    user.cursorless_record_that_mark_test()

{user.cursorless_homophone} update cheatsheet:
    user.cursorless_cheat_sheet_update_json()

test snippet make <user.cursorless_target>:
    user.cursorless_single_target_command_no_wait("generateSnippet", cursorless_target, "testSnippet")
