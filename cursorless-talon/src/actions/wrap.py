from typing import Any

from talon import Context, Module, actions, app

from ..csv_overrides import init_csv_and_watch_changes
from ..paired_delimiter import paired_delimiters_map

mod = Module()

mod.tag(
    "cursorless_experimental_snippets",
    desc="tag for enabling experimental snippet support",
)

mod.list("cursorless_wrap_action", desc="Cursorless wrap action")
mod.list("cursorless_wrapper_snippet", desc="Cursorless wrapper snippet")

experimental_snippets_ctx = Context()
experimental_snippets_ctx.matches = r"""
tag: user.cursorless_experimental_snippets
"""


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
wrapper_snippets = {
    "else": "ifElseStatement.alternative",
    "if else": "ifElseStatement.consequence",
    "if": "ifStatement.consequence",
    "try": "tryCatchStatement.body",
    "link": "link.text",
}


@mod.capture(
    rule="<user.cursorless_wrapper_paired_delimiter> | {user.cursorless_wrapper_snippet}"
)
def cursorless_wrapper(m) -> dict[str, Any]:
    try:
        paired_delimiter_info = paired_delimiters_map[
            m.cursorless_wrapper_paired_delimiter
        ]
        return {
            "type": "pairedDelimiter",
            "extra_args": [paired_delimiter_info.left, paired_delimiter_info.right],
        }
    except AttributeError:
        return {
            "type": "snippet",
            "extra_args": [m.cursorless_wrapper_snippet],
        }


# Maps from (action_type, wrapper_type) to action name
action_map = {
    ("wrapWithPairedDelimiter", "pairedDelimiter"): "wrapWithPairedDelimiter",
    # This is awkward because we used an action name which was to verbose previously
    ("wrapWithPairedDelimiter", "snippet"): "wrapWithSnippet",
    ("rewrap", "pairedDelimiter"): "rewrapWithPairedDelimiter",
    # Not yet supported
    ("rewrap", "snippet"): "rewrapWithSnippet",
}


@mod.action_class
class Actions:
    def cursorless_wrap(action_type: str, targets: dict, cursorless_wrapper: dict):
        """Perform cursorless wrap action"""
        wrapper_type = cursorless_wrapper["type"]
        action = action_map[(action_type, wrapper_type)]

        actions.user.cursorless_single_target_command_with_arg_list(
            action, targets, cursorless_wrapper["extra_args"]
        )


def on_ready():
    init_csv_and_watch_changes(
        "experimental/wrapper_snippets",
        {
            "wrapper_snippet": wrapper_snippets,
        },
        allow_unknown_values=True,
        default_list_name="wrapper_snippet",
        ctx=experimental_snippets_ctx,
    )


app.register("ready", on_ready)
