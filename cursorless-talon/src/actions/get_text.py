from typing import Optional

from talon import actions

from ..targets.target_types import CursorlessTarget


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
