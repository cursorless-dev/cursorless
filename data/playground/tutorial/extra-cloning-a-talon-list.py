from talon import Context, Module

mod = Module()
ctx = Context()

mod.list("cursorless_walkthrough_list", desc="My tutorial list")
ctx.list["user.cursorless_walkthrough_list"] = {
    "spoken form": "whatever",
}
