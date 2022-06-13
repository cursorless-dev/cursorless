from dataclasses import dataclass

from talon import Module


@dataclass
class MakeshiftAction:
    term: str
    identifier: str
    vscode_command_id: str
    vscode_command_args: list = None
    restore_selection: bool = False
    post_command_sleep_ms: int = None
    await_command: bool = True


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
makeshift_actions = [
    MakeshiftAction("define", "revealDefinition", "editor.action.revealDefinition"),
    MakeshiftAction(
        "type deaf", "revealTypeDefinition", "editor.action.goToTypeDefinition"
    ),
    MakeshiftAction("hover", "showHover", "editor.action.showHover"),
    MakeshiftAction("inspect", "showDebugHover", "editor.debug.action.showDebugHover"),
    MakeshiftAction(
        "quick fix",
        "showQuickFix",
        "editor.action.quickFix",
        restore_selection=True,
        post_command_sleep_ms=100,
    ),
    MakeshiftAction(
        "reference", "showReferences", "references-view.find", restore_selection=True
    ),
    MakeshiftAction(
        "rename",
        "rename",
        "editor.action.rename",
        restore_selection=True,
        await_command=False,
        post_command_sleep_ms=200,
    ),
]

makeshift_action_defaults = {
    action.term: action.identifier for action in makeshift_actions
}

mod = Module()
mod.list(
    "cursorless_makeshift_action",
    desc="Supported makeshift actions for cursorless navigation",
)


@dataclass
class TalonOptions:
    post_command_sleep_ms: int = None
    await_command: bool = True


def get_parameters(action: MakeshiftAction):
    command = action.vscode_command_id
    command_options = {
        "restoreSelection": action.restore_selection,
    }
    if action.vscode_command_args:
        command_options["commandArgs"] = action.vscode_command_args

    talon_options = TalonOptions(
        post_command_sleep_ms=action.post_command_sleep_ms,
        await_command=action.await_command,
    )

    return command, command_options, talon_options


makeshift_action_map = {
    action.identifier: get_parameters(action) for action in makeshift_actions
}
