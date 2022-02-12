from talon import Module
from dataclasses import dataclass
from .homophones import run_homophones_action
from .find import run_find_action
from .call import run_call_action


@dataclass
class CallbackAction:
    term: str
    identifier: str
    callback: callable


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://github.com/cursorless-dev/cursorless-vscode/blob/main/docs/user/customization.md
callbacks = [
    CallbackAction("call", "callAsFunction", run_call_action),
    CallbackAction("scout", "findInDocument", run_find_action),
    CallbackAction("phones", "nextHomophone", run_homophones_action),
]

callback_action_defaults = {
    callback.term: callback.identifier for callback in callbacks
}
callback_action_map = {callback.identifier: callback.callback for callback in callbacks}

mod = Module()
mod.list(
    "cursorless_callback_action",
    desc="Supported callback actions for cursorless navigation",
)
