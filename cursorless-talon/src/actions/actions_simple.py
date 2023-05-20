from talon import Module

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
simple_action_defaults = {
    "bottom": "scrollToBottom",
    "break point": "toggleLineBreakpoint",
    "carve": "cutToClipboard",
    "center": "scrollToCenter",
    "change": "clearAndSetSelection",
    "chuck": "remove",
    "clone up": "insertCopyBefore",
    "clone": "insertCopyAfter",
    "comment": "toggleLineComment",
    "copy": "copyToClipboard",
    "crown": "scrollToTop",
    "dedent": "outdentLine",
    "define": "revealDefinition",
    "drink": "editNewLineBefore",
    "drop": "insertEmptyLineBefore",
    "extract": "extractVariable",
    "float": "insertEmptyLineAfter",
    "fold": "foldRegion",
    "follow": "followLink",
    "give": "deselect",
    "highlight": "highlight",
    "hover": "showHover",
    "indent": "indentLine",
    "inspect": "showDebugHover",
    "post": "setSelectionAfter",
    "pour": "editNewLineAfter",
    "pre": "setSelectionBefore",
    "puff": "insertEmptyLinesAround",
    "quick fix": "showQuickFix",
    "reference": "showReferences",
    "rename": "rename",
    "reverse": "reverseTargets",
    "scout all": "findInWorkspace",
    "shuffle": "randomizeTargets",
    "snippet make": "generateSnippet",
    "sort": "sortTargets",
    "take": "setSelection",
    "type deaf": "revealTypeDefinition",
    "unfold": "unfoldRegion",
}

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
positional_action_defaults = {
    "paste": "pasteFromClipboard",
}

# Don't wait for these actions to finish, usually because they hang on some kind of user interaction
no_wait_actions = [
    "generateSnippet",
    "rename",
]

# These are actions that we don't wait for, but still want to have a post action sleep
no_wait_actions_post_sleep = {
    "rename": 0.3,
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
