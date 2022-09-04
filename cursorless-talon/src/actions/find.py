from talon import Module

mod = Module()


@mod.action_class
class Actions:
    def run_find_action(targets: dict):
        """Find text in editor"""
