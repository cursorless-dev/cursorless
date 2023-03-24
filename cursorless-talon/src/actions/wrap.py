from dataclasses import dataclass
from typing import Literal, Union

from talon import Module, actions

from ..paired_delimiter import paired_delimiters_map


@dataclass
class Wrapper:
    type: Literal["pairedDelimiter", "snippet"]
    extra_args: list[Union[str, dict]]


mod = Module()

mod.list("cursorless_wrap_action", desc="Cursorless wrap action")


@mod.capture(
    rule="<user.cursorless_wrapper_paired_delimiter> | {user.cursorless_wrapper_snippet}"
)
def cursorless_wrapper(m) -> Wrapper:
    try:
        paired_delimiter_info = paired_delimiters_map[
            m.cursorless_wrapper_paired_delimiter
        ]
        return Wrapper(
            type="pairedDelimiter",
            extra_args=[paired_delimiter_info.left, paired_delimiter_info.right],
        )
    except AttributeError:
        snippet_name, variable_name = parse_snippet_location(
            m.cursorless_wrapper_snippet
        )
        return Wrapper(
            type="snippet",
            extra_args=[
                {
                    "type": "named",
                    "name": snippet_name,
                    "variableName": variable_name,
                }
            ],
        )


def parse_snippet_location(snippet_location: str) -> tuple[str, str]:
    [snippet_name, variable_name] = snippet_location.split(".")
    if snippet_name is None or variable_name is None:
        raise Exception("Snippet location missing '.'")
    return (snippet_name, variable_name)


# Maps from (action_type, wrapper_type) to action name
action_map: dict[tuple[str, Literal["pairedDelimiter", "snippet"]], str] = {
    ("wrapWithPairedDelimiter", "pairedDelimiter"): "wrapWithPairedDelimiter",
    # This is awkward because we used an action name which was to verbose previously
    ("wrapWithPairedDelimiter", "snippet"): "wrapWithSnippet",
    ("rewrap", "pairedDelimiter"): "rewrapWithPairedDelimiter",
    # Not yet supported
    ("rewrap", "snippet"): "rewrapWithSnippet",
}


@mod.action_class
class Actions:
    def cursorless_wrap(action_type: str, targets: dict, cursorless_wrapper: Wrapper):
        """Perform cursorless wrap action"""
        wrapper_type = cursorless_wrapper.type
        action = action_map[(action_type, wrapper_type)]

        actions.user.cursorless_single_target_command_with_arg_list(
            action, targets, cursorless_wrapper.extra_args
        )
