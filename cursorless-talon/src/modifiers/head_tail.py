from dataclasses import dataclass

from talon import Module

mod = Module()
mod.list("cursorless_head_tail", desc="Cursorless modifier for head or tail of line")


@dataclass
class HeadTail:
    defaultSpokenForm: str
    cursorlessIdentifier: str
    type: str


head_tail_list = [
    HeadTail("head", "extendThroughStartOf", "head"),
    HeadTail("tail", "extendThroughEndOf", "tail"),
]
head_tail_map = {i.cursorlessIdentifier: i.type for i in head_tail_list}
head_tail = {i.defaultSpokenForm: i.cursorlessIdentifier for i in head_tail_list}


@mod.capture(rule="{user.cursorless_head_tail}")
def cursorless_head_tail(m) -> dict:
    return {
        "modifier": {
            "type": head_tail_map[m.cursorless_head_tail],
        }
    }
