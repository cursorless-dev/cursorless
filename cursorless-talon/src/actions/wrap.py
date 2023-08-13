from talon import Module, actions

from ..targets.target_types import CursorlessTarget

mod = Module()

mod.list("cursorless_wrap_action", desc="Cursorless wrap action")


@mod.action_class
class Actions:
    def private_cursorless_wrap_with_paired_delimiter(
        action_name: str, target: CursorlessTarget, paired_delimiter: list[str]
    ):
        """Execute Cursorless wrap/rewrap with paired delimiter action"""
        if action_name == "rewrap":
            action_name = "rewrapWithPairedDelimiter"

        actions.user.private_cursorless_command_and_wait(
            {
                "name": action_name,
                "left": paired_delimiter[0],
                "right": paired_delimiter[1],
                "target": target,
            }
        )

    def private_cursorless_wrap_with_snippet(
        action_name: str, target: CursorlessTarget, snippet_location: str
    ):
        """Execute Cursorless wrap with snippet action"""
        if action_name == "wrapWithPairedDelimiter":
            action_name = "wrapWithSnippet"
        elif action_name == "rewrap":
            raise Exception("Rewrapping with snippet not supported")

        snippet_name, variable_name = parse_snippet_location(snippet_location)

        actions.user.private_cursorless_command_and_wait(
            {
                "name": action_name,
                "snippetDescription": {
                    "type": "named",
                    "name": snippet_name,
                    "variableName": variable_name,
                },
                "target": target,
            }
        )


def parse_snippet_location(snippet_location: str) -> tuple[str, str]:
    [snippet_name, variable_name] = snippet_location.split(".")
    if snippet_name is None or variable_name is None:
        raise Exception("Snippet location missing '.'")
    return (snippet_name, variable_name)
