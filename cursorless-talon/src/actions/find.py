from talon import Module

mod = Module()


@mod.action_class
class Actions:
    def cursorless_private_run_find_action(targets: dict):
        """Find text of targets in editor"""
