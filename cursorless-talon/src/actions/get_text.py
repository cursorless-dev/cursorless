from typing import Optional
from talon import Module, actions

from ..targets.target_types import CursorlessTarget

mod = Module()


@mod.action_class
class Actions:
    def cursorless_get_text(
        target: CursorlessTarget,
        no_decorations: Optional[bool] = None,
    ) -> str:
        """Get target text"""
        return cursorless_get_text(
            target,
            no_decorations=no_decorations,
            ensure_single_target=True,
        )[0]

    def cursorless_get_text_list(
        target: CursorlessTarget,
        no_decorations: Optional[bool] = None,
    ) -> list[str]:
        """Get texts for multiple targets"""
        return cursorless_get_text(
            target,
            no_decorations=no_decorations,
            ensure_single_target=False,
        )


def cursorless_get_text(
    target: CursorlessTarget,
    *,
    no_decorations: Optional[bool] = None,
    ensure_single_target: Optional[bool] = None,
) -> list[str]:
    """Get target texts"""
    options: dict[str, bool] = {}

    if no_decorations is not None:
        options["showDecorations"] = not no_decorations
    if ensure_single_target is not None:
        options["ensureSingleTarget"] = ensure_single_target

    return actions.user.private_cursorless_command_get(
        {
            "name": "getText",
            "options": options,
            "target": target,
        }
    )
