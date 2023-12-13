import json
import re
from pathlib import Path
from typing import Callable

import yaml
from talon import actions, app

from .get_action_spoken_form import lookup_action

regex = re.compile(r"\{(\w+):([^}]+)\}")
tutorial_dir = Path(
    r"C:\work\tools\voicecoding\cursorless_fork\packages\cursorless-vscode-e2e\src\suite\fixtures\recorded\tutorial\unit-2-basic-coding"
)


def process_literal_step(argument: str):
    return f"<cmd@{argument}/>"


def process_action(argument: str):
    _, spoken_form = lookup_action(argument)
    return f'<*"{spoken_form}"/>'


def process_scope_type(argument: str):
    _, spoken_form = lookup_scope_type(argument)
    return f'<*"{spoken_form}"/>'


def process_cursorless_command_step(argument: str):
    print(f"{argument=}")
    step_fixture = yaml.safe_load((tutorial_dir / argument).read_text())
    print(f"{step_fixture['command']=}")
    result = actions.user.private_cursorless_run_rpc_command_get(
        "cursorless.tutorial.create",
        {
            "version": 0,
            "stepFixture": step_fixture,
        },
    )
    print(f"{result=}")
    return f"<cmd@{cursorless_command_to_spoken_form(step_fixture['command'])}/>"
    # return f"<cmd@{result}/>"


# TODO get this information from the extension
def cursorless_command_to_spoken_form(command: dict[str, str]):
    return command["spokenForm"]


interpolation_processor_map: dict[str, Callable[[str], str]] = {
    "literalStep": process_literal_step,
    "action": process_action,
    "scopeType": process_scope_type,
    "step": process_cursorless_command_step,
}


def process_tutorial_step(raw: str):
    print(f"{raw=}")
    current_index = 0
    content = ""
    for match in regex.finditer(raw):
        content += raw[current_index : match.start()]
        content += interpolation_processor_map[match.group(1)](match.group(2))
        current_index = match.end()
    content += raw[current_index : len(raw)]
    print(f"{content=}")

    return {
        "content": content,
        "restore_callback": print,
        "modes": ["command"],
        "app": "Code",
        "context_hint": "Please open VSCode and enter command mode",
    }


def get_basic_coding_walkthrough():
    with open(tutorial_dir / "script.json") as f:
        script = json.load(f)

    return [
        actions.user.hud_create_walkthrough_step(**process_tutorial_step(step))
        for step in script
    ]


def on_ready():
    actions.user.hud_add_lazy_walkthrough(
        "Cursorless basic coding", get_basic_coding_walkthrough
    )


app.register("ready", on_ready)
