from talon import Module

mod = Module()

mod.list(
    "cursorless_glyph_scope_type",
    desc="Cursorless glyph scope type",
)
mod.list(
    "cursorless_glyph_scope_type_plural",
    desc="Plural version of Cursorless glyph scope type",
)


@mod.capture(rule="{user.cursorless_glyph_scope_type} <user.any_alphanumeric_key>")
def cursorless_glyph_scope_type(m) -> dict[str, str]:
    return {
        "type": "glyph",
        "character": m.any_alphanumeric_key,
    }


@mod.capture(
    rule="{user.cursorless_glyph_scope_type_plural} <user.any_alphanumeric_key>"
)
def cursorless_glyph_scope_type_plural(m) -> dict[str, str]:
    return {
        "type": "glyph",
        "character": m.any_alphanumeric_key,
    }
