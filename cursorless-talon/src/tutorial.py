from dataclasses import dataclass
from typing import NotRequired, TypedDict

from talon import actions, app


# TypedDict of tutorial step
class Step(TypedDict):
    content: str
    fixturePath: NotRequired[str]


@dataclass
class Tutorial:
    tutorial_name: str
    steps: list[Step]


current_tutorial: Tutorial | None = None


def step_callback(x: int):
    print(f"step_callback5: {x}")
    if current_tutorial is None:
        raise Exception("current_tutorial is None")

    fixture_path = current_tutorial.steps[x].get("fixturePath", None)

    if fixture_path:
        actions.user.private_cursorless_run_rpc_command_and_wait(
            "cursorless.tutorial.setupStep",
            {
                "version": 0,
                "tutorialName": current_tutorial.tutorial_name,
                "fixturePath": fixture_path,
            },
        )
        # the below seems not needed
        # while True:
        #     # this is a hack to make sure vscode window was correctly reloaded
        #     # for instance if the user focused another window like the browser
        #     # when saying "help cursorless"
        #     ret = actions.user.private_cursorless_run_rpc_command_get(
        #         "cursorless.tutorial.setupStep",
        #         {
        #             "version": 1,
        #             "tutorialName": "unit-1-basic-coding",
        #             "yamlFilename": yamlFilename,
        #         },
        #     )
        #     if ret:
        #         break


def start_cursorless_walkthrough(tutorial_name: str):
    global current_tutorial
    print("get_basic_coding_walkthrough start")
    tutorial_content = actions.user.private_cursorless_run_rpc_command_get(
        "cursorless.tutorial.getContent",
        {"version": 0, "tutorialName": tutorial_name},
    )
    current_tutorial = Tutorial(tutorial_name, tutorial_content["content"])
    print(f"{tutorial_content=}")
    walkthrough_steps = []
    for content in tutorial_content["content"]:
        walkthrough_steps.append(
            actions.user.hud_create_walkthrough_step(
                content=content,
                restore_callback=step_callback,
                modes=["command"],
                app="Visual Studio Code",  # Windows
                # app="Code",  # OS X?
                # TODO: Fix this; should just be "vscode". Prob need fix to talon_hud itself
                context_hint="Please open VSCode and enter command mode",
            )
        )
    print("get_basic_coding_walkthrough end")
    return walkthrough_steps


# this is adding the menu to the hud
# by adding a list of HudWalkThroughStep
def on_ready():
    actions.user.hud_add_lazy_walkthrough(
        "Cursorless basic coding",
        lambda: start_cursorless_walkthrough("unit-2-basic-coding"),
    )


app.register("ready", on_ready)
