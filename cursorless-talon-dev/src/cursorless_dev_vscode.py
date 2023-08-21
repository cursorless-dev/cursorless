from talon import Context, Module

mod = Module()
ctx = Context()

ctx.matches = r"""
app: vscode
win.title: /cursorless/
"""


mod.list(
    "cursorless_launch_configuration", "A launch configuration for Cursorless vscode"
)

ctx.lists["user.cursorless_launch_configuration"] = {
    "stench": "Run extension",
    "test": "Extension tests",
    "test subset": "Extension tests subset",
    "test unit": "Unit tests only",
    "test talon": "Talon tests",
    "test talon subset": "Talon tests subset",
    # "Update fixtures": "Update fixtures",
    # "Update fixtures subset": "Update fixtures subset",
    # "Docusaurus start": "Docusaurus start",
    # "Docusaurus build": "Docusaurus build",
    # "cursorless.org client-side": "cursorless.org client-side",
}
