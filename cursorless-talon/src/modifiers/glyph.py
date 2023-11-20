from talon import Module

mod = Module()

mod.list(
    "cursorless_glyph_modifier",
    desc="Cursorless glyph,  modifier",
)


@mod.capture(rule="{user.cursorless_glyph_modifier} <user.any_alphanumeric_key>")
def cursorless_glyph_modifier(m) -> dict[str, str]:
    return {
        "type": "glyph",
        "glyph": m.any_alphanumeric_key,
    }
