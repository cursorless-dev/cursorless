from typing import Any
from talon import Module

mod = Module()

mod.list("cursorless_scope_type", desc="Supported scope types")
mod.list("cursorless_scope_type_plural", desc="Supported plural scope types")
mod.list(
    "cursorless_custom_regex_scope_type",
    desc="Supported custom regular expression scope types",
)
mod.list(
    "cursorless_custom_regex_scope_type_plural",
    desc="Supported plural custom regular expression scope types",
)
mod.list(
    "cursorless_contiguous_scope_type",
    desc="Cursorless contiguous scope type",
)


@mod.capture(
    rule="[{user.cursorless_contiguous_scope_type}] ({user.cursorless_scope_type} | {user.cursorless_custom_regex_scope_type})"
)
def cursorless_scope_type(m) -> dict[str, Any]:
    """Cursorless scope type singular"""
    try:
        scope_type = {"type": m.cursorless_scope_type}
    except AttributeError:
        scope_type = {
            "type": "customRegex",
            "regex": m.cursorless_custom_regex_scope_type,
        }

    try:
        return {"type": m.cursorless_contiguous_scope_type, "scopeType": scope_type}
    except AttributeError:
        return scope_type


@mod.capture(
    rule="[{user.cursorless_contiguous_scope_type}] ({user.cursorless_scope_type_plural} | {user.cursorless_custom_regex_scope_type_plural})"
)
def cursorless_scope_type_plural(m) -> dict[str, Any]:
    """Cursorless scope type plural"""
    try:
        scope_type = {"type": m.cursorless_scope_type_plural}
    except AttributeError:
        scope_type = {
            "type": "customRegex",
            "regex": m.cursorless_custom_regex_scope_type_plural,
        }

    try:
        return {"type": m.cursorless_contiguous_scope_type, "scopeType": scope_type}
    except AttributeError:
        return scope_type
