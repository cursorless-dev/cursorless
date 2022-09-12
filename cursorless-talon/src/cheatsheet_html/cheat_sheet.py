import tempfile
import webbrowser
from pathlib import Path

from talon import Context, Module, actions, app

from .get_list import get_list, get_lists
from .sections.actions import get_actions
from .sections.compound_targets import get_compound_targets
from .sections.modifiers import get_modifiers
from .sections.scopes import get_scopes
from .sections.special_marks import get_special_marks

mod = Module()
ctx = Context()
ctx.matches = r"""
app: vscode
"""

cheatsheet_out_dir = Path(tempfile.mkdtemp())
instructions_url = "https://www.cursorless.org/docs/"


@mod.action_class
class Actions:
    def cursorless_cheat_sheet_show_html():
        """Show new cursorless html cheat sheet"""
        app.notify(
            'Please first focus an app that supports cursorless, eg say "focus code"'
        )

    def cursorless_open_instructions():
        """Open web page with cursorless instructions"""
        webbrowser.open(instructions_url)


@ctx.action_class("user")
class Actions:
    def cursorless_cheat_sheet_show_html():
        """Show new cursorless html cheat sheet"""
        cheatsheet_out_path = cheatsheet_out_dir / "cheatsheet.html"
        actions.user.vscode_with_plugin_and_wait(
            "cursorless.showCheatsheet",
            {
                "version": 0,
                "spokenFormInfo": cursorless_cheat_sheet_get_json(),
                "outputPath": str(cheatsheet_out_path),
            },
        )
        webbrowser.open(cheatsheet_out_path.as_uri())


def cursorless_cheat_sheet_get_json():
    """Get cursorless cheat sheet json"""
    return {
        "sections": [
            {
                "name": "Actions",
                "id": "actions",
                "items": get_actions(),
            },
            {
                "name": "Scopes",
                "id": "scopes",
                "items": get_scopes(),
            },
            {
                "name": "Modifiers",
                "id": "modifiers",
                "items": get_modifiers(),
            },
            {
                "name": "Paired delimiters",
                "id": "pairedDelimiters",
                "items": get_lists(
                    [
                        "wrapper_only_paired_delimiter",
                        "wrapper_selectable_paired_delimiter",
                        "selectable_only_paired_delimiter",
                    ],
                    "pairedDelimiter",
                ),
            },
            {
                "name": "Special marks",
                "id": "specialMarks",
                "items": get_special_marks(),
            },
            {
                "name": "Positions",
                "id": "positions",
                "items": get_list("position", "position"),
            },
            {
                "name": "Compound targets",
                "id": "compoundTargets",
                "items": get_compound_targets(),
            },
            {
                "name": "Colors",
                "id": "colors",
                "items": get_list("hat_color", "hatColor"),
            },
            {
                "name": "Shapes",
                "id": "shapes",
                "items": get_list("hat_shape", "hatShape"),
            },
        ]
    }
