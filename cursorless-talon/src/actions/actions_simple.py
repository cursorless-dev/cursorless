from talon import Module

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
simple_action_defaults = {
    "bottom": "scrollToBottom",
    "break point": "toggleLineBreakpoint",
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
    "follow": "followLink",
    "give": "deselect",
    "highlight": "highlight",
    "indent": "indentLine",
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

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
positional_action_defaults = {
    "paste": "pasteFromClipboard",
}

mod = Module()
mod.list(
    "cursorless_simple_action",
    desc="Supported simple actions for cursorless navigation",
)
mod.list(
    "cursorless_positional_action",
    desc="Supported actions for cursorless that expect a positional target",
)
