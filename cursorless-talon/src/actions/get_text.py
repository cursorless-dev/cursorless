from talon import actions


def get_text(
    target: dict, show_decorations: bool = None, ensure_single_target: bool = None
):
    """Get target texts"""
    return actions.user.cursorless_single_target_command_get(
        "getText",
        target,
        {
            "showDecorations": show_decorations,
            "ensureSingleTarget": ensure_single_target,
        },
    )
