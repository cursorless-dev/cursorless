from talon import Context, actions

ctx = Context()

ctx.matches = r"""
app: neovim
"""

ctx.tags = ["user.cursorless"]
