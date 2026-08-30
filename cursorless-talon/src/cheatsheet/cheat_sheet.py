import webbrowser
from pathlib import Path

from talon import Context, Module, actions, app

mod = Module()
ctx = Context()
ctx.matches = r"""
tag: user.cursorless
"""

instructions_url = "https://www.cursorless.org/docs/"


@mod.action_class
class Actions:
    def private_cursorless_cheat_sheet_show_html():
        """Show new cursorless html cheat sheet"""
        app.notify(
            'Please first focus an app that supports cursorless, eg say "focus code"'
        )

    def private_cursorless_open_instructions():
        """Open web page with cursorless instructions"""
        actions.user.private_cursorless_notify_docs_opened()
        webbrowser.open(instructions_url)


@ctx.action_class("user")
class CursorlessActions:
    def private_cursorless_cheat_sheet_show_html():
        """Show cursorless html cheat sheet"""
        # On Linux browsers installed using snap can't open files in a hidden directory
        if app.platform == "linux":
            cheatsheet_out_dir = cheatsheet_dir_linux()
            cheatsheet_filename = "cursorless-cheatsheet.html"
        else:
            cheatsheet_out_dir = Path.home() / ".cursorless"
            cheatsheet_filename = "cheatsheet.html"

        cheatsheet_out_dir.mkdir(parents=True, exist_ok=True)
        cheatsheet_out_path = cheatsheet_out_dir / cheatsheet_filename
        actions.user.private_cursorless_run_rpc_command_and_wait(
            "cursorless.showCheatsheet",
            {
                "version": 1,
                "outputPath": str(cheatsheet_out_path),
            },
        )
        webbrowser.open(cheatsheet_out_path.as_uri())


def cheatsheet_dir_linux() -> Path:
    """Get cheatsheet directory for Linux"""
    try:
        # 1. Get users actual document directory
        import platformdirs  # pyright: ignore [reportMissingImports]

        return Path(platformdirs.user_documents_dir())
    except Exception:
        # 2. Look for a documents directory in user home
        user_documents_dir = Path.home() / "Documents"
        if user_documents_dir.is_dir():
            return user_documents_dir

        # 3. Fall back to user home
        return Path.home()
