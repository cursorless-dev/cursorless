"""
This file exists in our monorepo so that if someone accidentally clones this monorepo
into their talon folder instead of cursorless-talon, they'll get a helpful error popup
"""
from talon import app


def on_ready():
    app.notify(
        "Whoops! You cloned our monorepo instead of cursorless-talon",
        "Please remove cursorless and clone cursorless-talon instead:",
        "https://github.com/cursorless-dev/cursorless-talon",
    )


app.register("ready", on_ready)
