from typing import Any

from talon import Module, actions

mod = Module()


@mod.action_class
class Actions:
    def private_cursorless_record_navigation_test():
        """Start / stop recording Cursorless navigation tests"""
        actions.user.run_rpc_command(
            "cursorless.recordTestCase", {"isHatTokenMapTest": True}
        )

    def private_cursorless_record_error_test():
        """Start recording Cursorless error tests"""
        actions.user.run_rpc_command(
            "cursorless.recordTestCase", {"recordErrors": True}
        )

    def private_cursorless_record_highlights_test():
        """Start recording Cursorless decoration tests"""
        actions.user.run_rpc_command(
            "cursorless.recordTestCase", {"isDecorationsTest": True}
        )

    def private_cursorless_record_that_mark_test():
        """Start recording Cursorless that mark tests"""
        actions.user.run_rpc_command(
            "cursorless.recordTestCase", {"captureFinalThatMark": True}
        )

    def cursorless_record_silent_test():
        """Start recording Cursorless tests, without confirmation popup windows"""
        actions.user.run_rpc_command("cursorless.recordTestCase", {"isSilent": True})

    def private_cursorless_make_snippet_test(target: Any):
        """Test generating a snippet"""
        actions.user.private_cursorless_command_no_wait(
            {
                "name": "generateSnippet",
                "dirPath": "",
                "snippetName": "testSnippet",
                "target": target,
            }
        )
