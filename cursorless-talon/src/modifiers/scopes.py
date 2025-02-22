from talon import Module

mod = Module()

mod.list("cursorless_scope_type", desc="Supported scope types")
mod.list("cursorless_scope_type_plural", desc="Supported plural scope types")

mod.list(
    "cursorless_glyph_scope_type",
    desc="Cursorless glyph scope type",
)
mod.list(
    "cursorless_glyph_scope_type_plural",
    desc="Plural version of Cursorless glyph scope type",
)

mod.list(
    "cursorless_surrounding_pair_scope_type",
    desc="Scope types that can function as surrounding pairs",
)
mod.list(
    "cursorless_surrounding_pair_scope_type_plural",
    desc="Plural form of scope types that can function as surrounding pairs",
)

mod.list(
    "cursorless_custom_regex_scope_type",
    desc="Supported custom regular expression scope types",
)
mod.list(
    "cursorless_custom_regex_scope_type_plural",
    desc="Supported plural custom regular expression scope types",
)

mod.list(
    "cursorless_scope_type_flattened",
    desc="All supported scope types flattened",
)
mod.list(
    "cursorless_scope_type_flattened_plural",
    desc="All supported plural scope types flattened",
)


@mod.capture(rule="{user.cursorless_scope_type_flattened}")
def cursorless_scope_type(m) -> dict[str, str]:
    """Cursorless scope type singular"""
    return creates_scope_type(m.cursorless_scope_type_flattened)


@mod.capture(rule="{user.cursorless_scope_type_flattened_plural}")
def cursorless_scope_type_plural(m) -> dict[str, str]:
    """Cursorless scope type plural"""
    return creates_scope_type(m.cursorless_scope_type_flattened_plural)


def creates_scope_type(id: str) -> dict[str, str]:
    grouping, value = id.split(".", 1)
    match grouping:
        case "simple":
            return {
                "type": value,
            }
        case "surroundingPair":
            return {
                "type": "surroundingPair",
                "delimiter": value,
            }
        case "customRegex":
            return {
                "type": "customRegex",
                "regex": value,
            }
        case "glyph":
            return {
                "type": "glyph",
                "character": value,
            }
        case _:
            raise ValueError(f"Unsupported scope type grouping: {grouping}")
