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

ctx.lists["user.cursorless_homophone"] = [
    "cursorless",
    "cursor less",
    "cursor list",
]
