from talon import Module, actions

mod = Module()


@mod.action_class
class Actions:
    def cursorless_replace(target: dict, texts: list[str] or dict):
        """Replace targets with texts"""
        actions.user.cursorless_single_target_command("replace", target, texts)
