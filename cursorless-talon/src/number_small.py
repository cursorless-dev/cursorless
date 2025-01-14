"""
DEPRECATED @ 2024-12-21
This file allows us to use a custom `number_small` capture.  See #1021 for more info.
"""

from talon import Module, app, registry

mod = Module()

mod.tag("cursorless_custom_number_small", "DEPRECATED!")


def on_ready():
    if "user.cursorless_custom_number_small" in registry.tags:
        print(
            "WARNING tag: 'user.cursorless_custom_number_small' is deprecated and should not be used anymore, as Cursorless now uses community number_small"
        )


app.register("ready", on_ready)
