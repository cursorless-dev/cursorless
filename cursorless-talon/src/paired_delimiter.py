from talon import Module

mod = Module()

mod.list(
    "cursorless_wrapper_only_paired_delimiter",
    desc="A paired delimiter that can only be used as a wrapper",
)
mod.list(
    "cursorless_selectable_only_paired_delimiter",
    desc="A paired delimiter that can only be used as a scope type",
)
mod.list(
    "cursorless_wrapper_selectable_paired_delimiter",
    desc="A paired delimiter that can be used as a scope type and as a wrapper",
)

# Maps from the id we use in the spoken form csv to the delimiter strings
paired_delimiters = {
    "curlyBrackets": ["{", "}"],
    "angleBrackets": ["<", ">"],
    "escapedDoubleQuotes": ['\\"', '\\"'],
    "escapedSingleQuotes": ["\\'", "\\'"],
    "escapedParentheses": ["\\(", "\\)"],
    "escapedSquareBrackets": ["\\[", "\\]"],
    "doubleQuotes": ['"', '"'],
    "parentheses": ["(", ")"],
    "backtickQuotes": ["`", "`"],
    "whitespace": [" ", " "],
    "squareBrackets": ["[", "]"],
    "singleQuotes": ["'", "'"],
    "any": ["", ""],
}


@mod.capture(
    rule=(
        "{user.cursorless_wrapper_only_paired_delimiter} |"
        "{user.cursorless_wrapper_selectable_paired_delimiter}"
    )
)
def cursorless_wrapper_paired_delimiter(m) -> list[str]:
    try:
        id = m.cursorless_wrapper_only_paired_delimiter
    except AttributeError:
        id = m.cursorless_wrapper_selectable_paired_delimiter
    return paired_delimiters[id]


@mod.capture(
    rule=(
        "{user.cursorless_selectable_only_paired_delimiter} |"
        "{user.cursorless_wrapper_selectable_paired_delimiter}"
    )
)
def cursorless_selectable_paired_delimiter(m) -> str:
    try:
        return m.cursorless_selectable_only_paired_delimiter
    except AttributeError:
        return m.cursorless_wrapper_selectable_paired_delimiter
