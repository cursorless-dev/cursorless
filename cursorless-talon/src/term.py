"""
Stores terms that are used in many different places
"""
from talon import Module

mod = Module()

CURSORLESS_WINDOW_TRIGGER = "(cursorless | cursor list | cursor less)"


@mod.capture(rule=CURSORLESS_WINDOW_TRIGGER)
def cursorless_window_trigger(m) -> str:
    """Term to trigger cursorless help functions in talon"""
    return str(m)
