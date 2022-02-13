from talon import Module

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://github.com/cursorless-dev/cursorless-vscode/blob/main/docs/user/customization.md
simple_action_defaults = {
    "bottom": "scrollToBottom",
    "breakpoint": "toggleLineBreakpoint",
    "carve": "cutToClipboard",
    "center": "scrollToCenter",
    "chuck": "remove",
    "change": "clearAndSetSelection",
    "clone up": "insertCopyBefore",
    "clone": "insertCopyAfter",
    "comment": "toggleLineComment",
    "copy": "copyToClipboard",
    "crown": "scrollToTop",
    "dedent": "outdentLine",
    "drink": "editNewLineBefore",
    "drop": "insertEmptyLineBefore",
    "extract": "extractVariable",
    "float": "insertEmptyLineAfter",
    "fold": "foldRegion",
    "give": "deselect",
    "indent": "indentLine",
    "paste to": "pasteFromClipboard",
    "post": "setSelectionAfter",
    "pour": "editNewLineAfter",
    "pre": "setSelectionBefore",
    "puff": "insertEmptyLinesAround",
    "shuffle": "randomizeTargets",
    "reverse": "reverseTargets",
    "scout all": "findInWorkspace",
    "sort": "sortTargets",
    "take": "setSelection",
    "unfold": "unfoldRegion",
}

mod = Module()
mod.list(
    "cursorless_simple_action",
    desc="Supported simple actions for cursorless navigation",
)
