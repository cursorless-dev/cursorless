from typing import Optional

from talon import actions

from ..targets.target_types import CursorlessTarget


def cursorless_get_text_action(
    target: CursorlessTarget,
    show_decorations: Optional[bool] = None,
    ensure_single_target: Optional[bool] = None,
) -> list[str]:
    """Get target texts"""
    return actions.user.private_cursorless_command_get(
        {
            "name": "getText",
            "options": {
                "showDecorations": show_decorations,
                "ensureSingleTarget": ensure_single_target,
            },
            "target": target,
        }
    )
