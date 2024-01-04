from typing import Callable

from talon import actions, app

from .get_action_spoken_form import lookup_action


tutorial_content = None


def step_callback(x):
    print(f"step_callback8: {x}")
    yamlFilename = tutorial_content["yamlFilenames"][x]
    if yamlFilename:
        actions.user.private_cursorless_run_rpc_command_get(
            "cursorless.tutorial.setupStep",
            {
                "version": 0,
                "tutorialName": "unit-2-basic-coding",
                "yamlFilename": yamlFilename,
            },
        )


def get_basic_coding_walkthrough():
    global tutorial_content
    print("get_basic_coding_walkthrough start")
    tutorial_content = actions.user.private_cursorless_run_rpc_command_get(
        "cursorless.tutorial.getContent",
        {"version": 0, "tutorialName": "unit-2-basic-coding"},
    )
    print(f"{tutorial_content=}")
    walkthrough_steps = []
    for content in tutorial_content["content"]:
        walkthrough_steps.append(
            actions.user.hud_create_walkthrough_step(
                content=content,
                restore_callback=step_callback,
                modes=["command"],
                app="Visual Studio Code",  # Windows
                # app="Code", # OS X?
                context_hint="Please open VSCode and enter command mode",
            )
        )
    print("get_basic_coding_walkthrough end")
    return walkthrough_steps


# this is adding the menu to the hud
# by adding a list of HudWalkThroughStep
def on_ready():
    actions.user.hud_add_lazy_walkthrough(
        "Cursorless basic coding", get_basic_coding_walkthrough
    )


app.register("ready", on_ready)
