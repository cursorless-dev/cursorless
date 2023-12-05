from talon import Module, actions

from ..targets.target_types import CursorlessTarget

mod = Module()


@mod.action_class
class Actions:
    def cursorless_get_text(
        target: CursorlessTarget,
        hide_decorations: bool = False,
    ) -> str:
        """Get target text"""
        return cursorless_get_text(
            target,
            hide_decorations=hide_decorations,
            ensure_single_target=True,
        )[0]

    def cursorless_get_text_list(
        target: CursorlessTarget,
        hide_decorations: bool = False,
    ) -> list[str]:
        """Get texts for multiple targets"""
        return cursorless_get_text(
            target,
            hide_decorations=hide_decorations,
            ensure_single_target=False,
        )


def cursorless_get_text(
    target: CursorlessTarget,
    *,
    hide_decorations: bool,
    ensure_single_target: bool,
) -> list[str]:
    """Get target texts"""
    options: dict[str, bool] = {}

    if hide_decorations:
        options["showDecorations"] = False
    if ensure_single_target:
        options["ensureSingleTarget"] = True

    return actions.user.private_cursorless_command_get(
        {
            "name": "getText",
            "options": options,
            "target": target,
        }
    )
