from talon import app


def onready():
    app.notify(
        "Don't clone Cursorless monorepo",
        "For Talon use cursorless-talon instead:",
        "https://github.com/cursorless-dev/cursorless-talon",
    )


app.register("ready", onready)
