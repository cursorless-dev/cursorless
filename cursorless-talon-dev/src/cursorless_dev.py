from talon import Module, actions

mod = Module()


@mod.action_class
class Actions:
    def cursorless_record_navigation_test():
        """Start / stop recording Cursorless navigation tests"""
        actions.user.run_rpc_command(
            "cursorless.recordTestCase", {"isHatTokenMapTest": True}
        )

    def cursorless_record_error_test():
        """Start recording Cursorless error tests"""
        actions.user.run_rpc_command(
            "cursorless.recordTestCase", {"recordErrors": True}
        )

    def cursorless_record_highlights_test():
        """Start recording Cursorless decoration tests"""
        actions.user.run_rpc_command(
            "cursorless.recordTestCase", {"isDecorationsTest": True}
        )

    def cursorless_record_that_mark_test():
        """Start recording Cursorless that mark tests"""
        actions.user.run_rpc_command(
            "cursorless.recordTestCase", {"captureFinalThatMark": True}
        )

    def cursorless_record_silent_test():
        """Start recording Cursorless tests, without confirmation popup windows"""
        actions.user.run_rpc_command("cursorless.recordTestCase", {"isSilent": True})
