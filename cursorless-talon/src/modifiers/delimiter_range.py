from typing import Any

from talon import Context, Module

mod = Module()
ctx = Context()


delimiter_ranges = {
    "leading": {"direction": "leading"},
    "trailing": {"direction": "trailing"},
}

mod.list("cursorless_delimiter_range", desc="Types of delimiter ranges")
ctx.lists["self.cursorless_delimiter_range"] = delimiter_ranges.keys()


@mod.capture(rule="{user.cursorless_delimiter_range}")
def cursorless_delimiter_range(m) -> dict[str, Any]:
    return {
        "type": "delimiterRange",
        **delimiter_ranges[m.cursorless_delimiter_range],
    }
