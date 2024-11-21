from talon import app


def on_ready():
    app.notify(
        "Don't clone Cursorless monorepo",
        "For Talon use cursorless-talon instead:",
        "https://github.com/cursorless-dev/cursorless-talon",
    )


app.register("ready", on_ready)
