from typing import Any

from talon import Module

mod = Module()


mod.list(
    "cursorless_to_raw_selection",
    desc="Cursorless modifier that converts its input to a raw selection.",
)


@mod.capture(rule="{user.cursorless_to_raw_selection}")
def cursorless_to_raw_selection(m) -> dict[str, Any]:
    return {"type": "toRawSelection"}
