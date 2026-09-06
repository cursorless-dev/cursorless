from typing import Any

from talon import Module, settings

mod = Module()

mod.list(
    "cursorless_every_scope_modifier",
    desc="Cursorless every scope modifiers",
)
mod.list(
    "cursorless_ancestor_scope_modifier",
    desc="Cursorless ancestor scope modifiers",
)

# This is a private setting and should not be used by non Cursorless developers
mod.setting(
    "private_cursorless_use_preferred_scope",
    type=bool,
    default=False,
    desc="Use preferred scope instead of containing scope for all scopes by default (EXPERIMENTAL)",
)


@mod.capture(
    rule=(
        "[{user.cursorless_every_scope_modifier} | {user.cursorless_ancestor_scope_modifier}+] "
        "<user.cursorless_scope_type>"
    ),
)
def cursorless_simple_scope_modifier(m) -> dict[str, Any]:
    """Containing scope, every scope, etc"""
    if hasattr(m, "cursorless_every_scope_modifier"):
        return {
            "type": "everyScope",
            "scopeType": m.cursorless_scope_type,
        }

    if hasattr(m, "cursorless_ancestor_scope_modifier"):
        return {
            "type": "containingScope",
            "scopeType": m.cursorless_scope_type,
            "ancestorIndex": len(m.cursorless_ancestor_scope_modifier_list),
        }

    if settings.get("user.private_cursorless_use_preferred_scope"):
        return {
            "type": "preferredScope",
            "scopeType": m.cursorless_scope_type,
        }

    return {
        "type": "containingScope",
        "scopeType": m.cursorless_scope_type,
    }
