from typing import Optional

from talon import Module, actions

from ..targets.target_types import CursorlessTarget

mod = Module()


@mod.action_class
class Actions:
    def cursorless_get_text(
        target: CursorlessTarget,
        show_decorations: bool = True,
    ) -> str:
        """Get target text"""
        return cursorless_get_text(
            target,
            show_decorations=show_decorations,
            ensure_single_target=True,
        )[0]

    def cursorless_get_text_list(
        target: CursorlessTarget,
        show_decorations: bool = True,
    ) -> list[str]:
        """Get texts for multiple targets"""
        return cursorless_get_text(
            target,
            show_decorations=show_decorations,
            ensure_single_target=False,
        )


def cursorless_get_text(
    target: CursorlessTarget,
    *,
    show_decorations: bool,
    ensure_single_target: bool,
) -> list[str]:
    """Get target texts"""
    options: dict[str, bool] = {
        "showDecorations": show_decorations,
        "ensureSingleTarget": ensure_single_target,
    }

    return actions.user.private_cursorless_command_get(
        {
            "name": "getText",
            "options": options,
            "target": target,
        }
    )
