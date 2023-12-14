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


@mod.capture(
    rule="{user.cursorless_scope_type} | <user.cursorless_glyph_scope_type> | {user.cursorless_custom_regex_scope_type}"
)
def cursorless_scope_type(m) -> dict[str, str]:
    """Cursorless scope type singular"""
    try:
        return {"type": m.cursorless_scope_type}
    except AttributeError:
        pass

    try:
        return m.cursorless_glyph_scope_type
    except AttributeError:
        pass

    return {"type": "customRegex", "regex": m.cursorless_custom_regex_scope_type}


@mod.capture(
    rule="{user.cursorless_scope_type_plural} | <user.cursorless_glyph_scope_type_plural> | {user.cursorless_custom_regex_scope_type_plural}"
)
def cursorless_scope_type_plural(m) -> dict[str, str]:
    """Cursorless scope type plural"""
    try:
        return {"type": m.cursorless_scope_type_plural}
    except AttributeError:
        pass

    try:
        return m.cursorless_glyph_scope_type_plural
    except AttributeError:
        pass

    return {
        "type": "customRegex",
        "regex": m.cursorless_custom_regex_scope_type_plural,
    }
