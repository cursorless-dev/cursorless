import webbrowser
from contextlib import suppress
from pathlib import Path

from talon import Module, actions

from .get_list import get_list, get_lists
from .sections.actions import get_actions
from .sections.compound_targets import get_compound_targets
from .sections.scopes import get_scopes

mod = Module()

instructions_url = "https://www.cursorless.org/docs/"


@mod.action_class
class Actions:
    def cursorless_cheat_sheet_show_html():
        """Show cursorless html cheat sheet"""

        # NB: We use the user's home directory instead of temp to make sure that
        # Linux snaps work
        cheatsheet_out_dir = Path.home() / ".cursorless" / "cheatsheet"
        cheatsheet_out_dir.mkdir(parents=True, exist_ok=True)

        cheatsheet_out_path = cheatsheet_out_dir / "index.html"
        actions.user.vscode_with_plugin_and_wait(
            "cursorless.showCheatsheet",
            {
                "version": 0,
                "spokenFormInfo": actions.user.cursorless_cheat_sheet_get_json(),
                "outputPath": str(cheatsheet_out_path),
            },
        )

        cheatsheet_local_uri = cheatsheet_out_path.as_uri()

        # NB: We explicitly ask for browsers by name rather than using the
        # default because the user may have set something like vscode to be the
        # default for html files.
        success = False
        for browser in ["chrome", "firefox"]:
            with suppress(Exception):
                webbrowser.get(browser).open(cheatsheet_local_uri)
                success = True
                break

        # Fall back to using the system default
        if not success:
            webbrowser.open(cheatsheet_local_uri)

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
                    "items": get_list("special_mark", "mark"),
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

    def cursorless_open_instructions():
        """Open web page with cursorless instructions"""
        webbrowser.open(instructions_url)
