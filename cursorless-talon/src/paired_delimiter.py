from dataclasses import dataclass

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


@dataclass
class PairedDelimiter:
    cursorlessIdentifier: str
    left: str
    right: str

    # Indicates whether the delimiter can be used to wrap a target
    is_wrapper: bool = True

    # Indicates whether the delimiter can be used for expanding to surrounding
    # pair.
    is_selectable: bool = True


paired_delimiters = [
    PairedDelimiter("curlyBrackets", "{", "}"),
    PairedDelimiter("angleBrackets", "<", ">"),
    PairedDelimiter("escapedDoubleQuotes", '\\"', '\\"'),
    PairedDelimiter("escapedSingleQuotes", "\\'", "\\'"),
    PairedDelimiter("escapedParentheses", "\\(", "\\)"),
    PairedDelimiter("escapedSquareBrackets", "\\[", "\\]"),
    PairedDelimiter("doubleQuotes", '"', '"'),
    PairedDelimiter("parentheses", "(", ")"),
    PairedDelimiter("backtickQuotes", "`", "`"),
    PairedDelimiter("whitespace", " ", " ", is_selectable=False),
    PairedDelimiter("squareBrackets", "[", "]"),
    PairedDelimiter("singleQuotes", "'", "'"),
    PairedDelimiter("any", "", "", is_wrapper=False),
]

paired_delimiters_map = {term.cursorlessIdentifier: term for term in paired_delimiters}


@mod.capture(
    rule=(
        "{user.cursorless_wrapper_only_paired_delimiter} |"
        "{user.cursorless_wrapper_selectable_paired_delimiter}"
    )
)
def cursorless_wrapper_paired_delimiter(m) -> PairedDelimiter:
    try:
        id = m.cursorless_wrapper_only_paired_delimiter
    except AttributeError:
        id = m.cursorless_wrapper_selectable_paired_delimiter
    return paired_delimiters_map[id]


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
