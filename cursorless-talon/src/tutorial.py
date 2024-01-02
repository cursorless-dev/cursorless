from typing import Callable

from talon import actions, app

from .get_action_spoken_form import lookup_action


# {literalStep:...}
# "To see all available scopes, use the command {literalStep:cursorless help}, and look at the Scopes section."
def process_literal_step(argument: str):
    return f"<cmd@{argument}/>"


# {action:...}
# "Say {action:setSelectionAfter} to place the cursor after a target: {step:postLook.yml}",
# "Say {action:clearAndSetSelection} to delete a word and move your cursor to where it used to be: {step:clearTrap.yml}",
# The {action:editNewLineAfter} action"  => "The "pour" action"
def process_action(argument: str):
    _, spoken_form = lookup_action(argument)
    return f'<*"{spoken_form}"/>'


# {scopeType:...}
# "We can also use {scopeType:line} to refer to the line containing our cursor: {step:takeLine.yml}"
# "Cursorless tries its best to keep your commands short. In the following command, we just say {scopeType:string} once, but cursorless infers that both targets are strings: {step:swapStringAirWithWhale.yml}"
def process_scope_type(argument: str):
    # _, spoken_form = lookup_scope_type(argument)
    # return f'<*"{spoken_form}"/>'
    return f'<*"SCOPETYPE_{argument}"/>'


# "When editing code, we often think in terms of statements, functions, etc. Let's clone a statement: {step:cloneStateInk.yml}",
#
# this builds a dictionary which has keys and values (each one is a spoken form)
# each value is built by calling the function with the argument being passed
# eg interpolation_processor_map["step"]()
interpolation_processor_map: dict[str, Callable[[str], str]] = {
    # this will exist extension side
    # nothing needed as  not a Cursorless command
    "literalStep": process_literal_step,
    # import https://github.com/cursorless-dev/cursorless/blob/7341d0f707b1d0a0950a19894be3aebbb33582c8/packages/cursorless-engine/src/generateSpokenForm/defaultSpokenForms/actions.ts#L7C1-L7C1
    # hardcoded list of default spoken form for an action (not yet the customized one)
    "action": process_action,
    # scopeTypeType == "line", etc.
    # generator.processScopeType({type: scopeTypeType})
    "scopeType": process_scope_type,
}

# TODO all the above will be deleted


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


tutorial_content = None


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
