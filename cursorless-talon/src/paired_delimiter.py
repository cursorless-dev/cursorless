from dataclasses import dataclass

from talon import Module, app

from .csv_overrides import init_csv_and_watch_changes

mod = Module()
mod.list(
    "cursorless_paired_delimiter", desc="A symbol that comes in pairs, eg brackets"
)
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
    defaultSpokenForm: str
    cursorlessIdentifier: str
    left: str
    right: str

    # Indicates whether the delimiter can be used to wrap a target
    is_wrapper: bool = True

    # Indicates whether the delimiter can be used for expanding to surrounding
    # pair.
    is_selectable: bool = True


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
paired_delimiters = [
    PairedDelimiter("curly", "curlyBrackets", "{", "}"),
    PairedDelimiter("diamond", "angleBrackets", "<", ">"),
    PairedDelimiter("escaped quad", "escapedDoubleQuotes", '\\"', '\\"'),
    PairedDelimiter("escaped twin", "escapedSingleQuotes", "\\'", "\\'"),
    PairedDelimiter("escaped round", "escapedParentheses", "\\(", "\\)"),
    PairedDelimiter("escaped box", "escapedSquareBrackets", "\\[", "\\]"),
    PairedDelimiter("quad", "doubleQuotes", '"', '"'),
    PairedDelimiter("round", "parentheses", "(", ")"),
    PairedDelimiter("skis", "backtickQuotes", "`", "`"),
    PairedDelimiter("void", "whitespace", " ", " ", is_selectable=False),
    PairedDelimiter("box", "squareBrackets", "[", "]"),
    PairedDelimiter("twin", "singleQuotes", "'", "'"),
    PairedDelimiter("pair", "any", "", "", is_wrapper=False),
]

paired_delimiters_map = {term.cursorlessIdentifier: term for term in paired_delimiters}

wrapper_paired_delimiters_defaults = {
    term.defaultSpokenForm: term.cursorlessIdentifier
    for term in paired_delimiters
    if term.is_wrapper and not term.is_selectable
}

selectable_paired_delimiters_defaults = {
    term.defaultSpokenForm: term.cursorlessIdentifier
    for term in paired_delimiters
    if term.is_selectable and not term.is_wrapper
}

wrapper_selectable_paired_delimiters_defaults = {
    term.defaultSpokenForm: term.cursorlessIdentifier
    for term in paired_delimiters
    if term.is_selectable and term.is_wrapper
}


@mod.capture(
    rule=(
        "{user.cursorless_wrapper_only_paired_delimiter} |"
        "{user.cursorless_wrapper_selectable_paired_delimiter}"
    )
)
def cursorless_wrapper_paired_delimiter(m) -> str:
    try:
        return m.cursorless_wrapper_only_paired_delimiter
    except AttributeError:
        return m.cursorless_wrapper_selectable_paired_delimiter


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


def on_ready():
    init_csv_and_watch_changes(
        "paired_delimiters",
        {
            "wrapper_only_paired_delimiter": wrapper_paired_delimiters_defaults,
            "selectable_only_paired_delimiter": selectable_paired_delimiters_defaults,
            "wrapper_selectable_paired_delimiter": wrapper_selectable_paired_delimiters_defaults,
        },
    )


app.register("ready", on_ready)
