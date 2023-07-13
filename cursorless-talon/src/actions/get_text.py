from typing import Optional

from ..command import cursorless_command_and_wait
from ..targets.target_types import CursorlessTarget


def cursorless_get_text(
    target: CursorlessTarget,
    show_decorations: Optional[bool] = None,
    ensure_single_target: Optional[bool] = None,
):
    """Get target texts"""
    cursorless_command_and_wait(
        {
            "name": "getText",
            "options": {
                "showDecorations": show_decorations,
                "ensureSingleTarget": ensure_single_target,
            },
            "target": target,
        }
    )
