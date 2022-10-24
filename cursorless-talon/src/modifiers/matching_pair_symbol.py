from typing import Any

from talon import Module

mod = Module()


@mod.capture(rule="matching")
def cursorless_matching_paired_delimiter(m) -> dict[str, Any]:
    return {"modifier": {"type": "matchingPairedDelimiter"}}
