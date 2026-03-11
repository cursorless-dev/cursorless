from typing import Any

from talon import Context, Module

mod = Module()

mod.list(
    "cursorless_reference_modifier",
    desc="Cursorless reference modifiers with snippet outputs",
)


REFERENCE_MODIFIER_DATA: dict[str, dict[str, Any]] = {
    "relative": [
        {
            "body": "$relative",
        },
    ],
    "absolute": [
        {
            "body": "$absolute",
        },
    ],
    "remote": [
        {
            "body": "$remote",
        },
    ],
    "remoteCanonical": [
        {
            "body": "$remoteCanonical",
        },
    ],
    "relativeText": [
        {
            "body": " $relative (`$content`) ",
            "lineMode": "singleLine",
        },
        {
            "body": "\n\n$relative:\n\n```$languageId\n$content\n```\n\n",
            "lineMode": "multiLine",
        },
    ],
    "remoteText": [
        {
            "body": " $remote (`$content`) ",
            "lineMode": "singleLine",
        },
        {
            "body": "\n\n$remote:\n\n```$languageId\n$content\n```\n\n",
            "lineMode": "multiLine",
        },
    ],
    "remoteLink": [
        {
            "body": "[`$name`]($remote)",
        },
    ],
    "relativeLink": [
        {
            "body": "[`$name`]($relative)",
        },
    ],
}

REFERENCE_SPOKEN_FORMS: dict[str, str] = {
    "local": "relative",
    "absolute": "absolute",
    "remote": "remote",
    "canonical": "remoteCanonical",
    "local text": "relativeText",
    "remote text": "remoteText",
    "local link": "relativeLink",
    "remote link": "remoteLink",
}

ctx = Context()
ctx.lists["user.cursorless_reference_modifier"] = REFERENCE_SPOKEN_FORMS


@mod.capture(rule="{user.cursorless_reference_modifier}")
def cursorless_reference_modifier(m) -> dict[str, Any]:
    """Reference modifier snippets"""
    modifier_id = m.cursorless_reference_modifier
    data = REFERENCE_MODIFIER_DATA[modifier_id]
    return {
        "type": "reference",
        "snippets": data,
    }
