"""
Stores terms that are used in many different places
"""

from talon import Context, Module

mod = Module()
ctx = Context()

mod.list(
    "cursorless_homophone",
    "Various alternative pronunciations of 'cursorless' to improve accuracy",
)

# FIXME: Remove type ignore once Talon supports list types
# See https://github.com/talonvoice/talon/issues/654
ctx.lists["user.cursorless_homophone"] = [  # pyright: ignore [reportArgumentType]
    "cursorless",
    "cursor less",
    "cursor list",
]
