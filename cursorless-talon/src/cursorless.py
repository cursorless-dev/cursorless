from talon import Context, Module, actions

mod = Module()

mod.tag(
    "cursorless",
    "Application supporting cursorless commands",
)

ctx = Context()
ctx.matches = r"""
tag: user.cursorless
"""


@mod.action_class
class Actions:
    def private_cursorless_show_settings_in_ide():
        """Show Cursorless-specific settings in ide"""

    def private_cursorless_show_sidebar():
        """Show Cursorless-specific settings in ide"""

    def private_cursorless_notify_docs_opened():
        """Notify the ide that the docs were opened in case the tutorial is waiting for that event"""
        actions.skip()

    def private_cursorless_show_command_statistics():
        """Show Cursorless command statistics"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.analyzeCommandHistory"
        )

    def private_cursorless_start_tutorial():
        """Start the introductory Cursorless tutorial"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.tutorial.start", "tutorial-1-basics"
        )

    def private_cursorless_tutorial_next():
        """Cursorless tutorial: next"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.tutorial.next"
        )

    def private_cursorless_tutorial_previous():
        """Cursorless tutorial: previous"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.tutorial.previous"
        )

    def private_cursorless_tutorial_restart():
        """Cursorless tutorial: restart"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.tutorial.restart"
        )

    def private_cursorless_tutorial_resume():
        """Cursorless tutorial: resume"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.tutorial.resume"
        )

    def private_cursorless_tutorial_list():
        """Cursorless tutorial: list all available tutorials"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.tutorial.list"
        )

    def private_cursorless_tutorial_start_by_number(number: int):  # pyright: ignore [reportGeneralTypeIssues]
        """Start Cursorless tutorial by number"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.tutorial.start", number - 1
        )


@ctx.action_class("user")
class CursorlessActions:
    def private_cursorless_notify_docs_opened():
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.documentationOpened"
        )
