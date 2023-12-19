from typing import Optional

from talon import Module, actions

from ..targets.target_types import CursorlessTarget

mod = Module()


@mod.action_class
class Actions:
    def cursorless_get_text(
        target: CursorlessTarget,
        hide_decorations: bool = False,
    ) -> str:
        """Get target text. If hide_decorations is True, don't show decorations"""
        return cursorless_get_text_action(
            target,
            show_decorations=not hide_decorations,
            ensure_single_target=True,
        )[0]

    def cursorless_get_text_list(
        target: CursorlessTarget,
        hide_decorations: bool = False,
    ) -> list[str]:
        """Get texts for multiple targets. If hide_decorations is True, don't show decorations"""
        return cursorless_get_text_action(
            target,
            show_decorations=not hide_decorations,
            ensure_single_target=False,
        )


def cursorless_get_text_action(
    target: CursorlessTarget,
    *,
    show_decorations: Optional[bool] = None,
    ensure_single_target: Optional[bool] = None,
) -> list[str]:
    """Get target texts"""
    options: dict[str, bool] = {}

    if show_decorations is not None:
        options["showDecorations"] = show_decorations

    if ensure_single_target is not None:
        options["ensureSingleTarget"] = ensure_single_target

    return actions.user.private_cursorless_command_get(
        {
            "name": "getText",
            "options": options,
            "target": target,
        }
    )
