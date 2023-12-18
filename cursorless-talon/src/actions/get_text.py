from typing import Optional

from talon import Module, actions

from ..targets.target_types import CursorlessTarget

mod = Module()


@mod.action_class
class Actions:
    def cursorless_get_text(
        target: CursorlessTarget,
        silent: bool = False,
    ) -> str:
        """Get target text. If silent, don't show decorations"""
        return cursorless_get_text(
            target,
            show_decorations=not silent,
            ensure_single_target=True,
        )[0]

    def cursorless_get_text_list(
        target: CursorlessTarget,
        silent: bool = False,
    ) -> list[str]:
        """Get texts for multiple targets. If silent, don't show decorations"""
        return cursorless_get_text(
            target,
            show_decorations=not silent,
            ensure_single_target=False,
        )


def cursorless_get_text(
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
