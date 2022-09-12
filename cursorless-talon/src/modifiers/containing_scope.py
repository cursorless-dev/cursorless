from typing import Any

from talon import Module, app

from ..csv_overrides import SPOKEN_FORM_HEADER, init_csv_and_watch_changes

mod = Module()


mod.list("cursorless_scope_type", desc="Supported scope types")
mod.list(
    "cursorless_custom_regex_scope_type",
    desc="Supported custom regular expression scope types",
)

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
scope_types = {
    "arg": "argumentOrParameter",
    "attribute": "attribute",
    "call": "functionCall",
    "callee": "functionCallee",
    "class name": "className",
    "class": "class",
    "comment": "comment",
    "funk name": "functionName",
    "funk": "namedFunction",
    "if state": "ifStatement",
    "item": "collectionItem",
    "key": "collectionKey",
    "lambda": "anonymousFunction",
    "list": "list",
    "map": "map",
    "name": "name",
    "regex": "regularExpression",
    "section": "section",
    "-one section": "sectionLevelOne",
    "-two section": "sectionLevelTwo",
    "-three section": "sectionLevelThree",
    "-four section": "sectionLevelFour",
    "-five section": "sectionLevelFive",
    "-six section": "sectionLevelSix",
    "selector": "selector",
    "state": "statement",
    "string": "string",
    "type": "type",
    "value": "value",
    "condition": "condition",
    #  XML, JSX
    "element": "xmlElement",
    "tags": "xmlBothTags",
    "start tag": "xmlStartTag",
    "end tag": "xmlEndTag",
    # Text-based scope types
    "block": "paragraph",
    "cell": "notebookCell",
    "file": "document",
    "line": "line",
    "paint": "nonWhitespaceSequence",
    "short paint": "boundedNonWhitespaceSequence",
    "link": "url",
    "token": "token",
    # LaTeX
    "part": "part",
    "chapter": "chapter",
    "subsection": "subSection",
    "subsubsection": "subSubSection",
    "paragraph": "namedParagraph",
    "subparagraph": "subParagraph",
    "environment": "environment",
}


@mod.capture(rule="{user.cursorless_scope_type}")
def cursorless_scope_type(m) -> dict[str, str]:
    """Simple cursorless scope type that only need to specify their type"""
    return {"type": m.cursorless_scope_type}


@mod.capture(rule="{user.cursorless_custom_regex_scope_type}")
def cursorless_custom_regex_scope_type(m) -> dict[str, str]:
    """Cursorless custom regular expression scope type"""
    return {"type": "customRegex", "regex": m.cursorless_custom_regex_scope_type}


@mod.capture(
    rule="[every] (<user.cursorless_scope_type> | <user.cursorless_custom_regex_scope_type>)"
)
def cursorless_containing_scope(m) -> dict[str, Any]:
    """Expand to containing scope"""
    try:
        scope_type = m.cursorless_scope_type
    except AttributeError:
        scope_type = m.cursorless_custom_regex_scope_type
    return {
        "type": "everyScope" if m[0] == "every" else "containingScope",
        "scopeType": scope_type,
    }


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
subtoken_scope_types = {
    "word": "word",
    "char": "character",
}

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
# NB: This is a hack until we support having inside and outside on arbitrary
# scope types
surrounding_pair_scope_types = {
    "string": "string",
}


def on_ready():
    init_csv_and_watch_changes(
        "modifier_scope_types",
        {
            "scope_type": scope_types,
            "subtoken_scope_type": subtoken_scope_types,
            "surrounding_pair_scope_type": surrounding_pair_scope_types,
        },
    )
    init_csv_and_watch_changes(
        "experimental/regex_scope_types",
        {},
        headers=[SPOKEN_FORM_HEADER, "Regex"],
        allow_unknown_values=True,
        default_list_name="custom_regex_scope_type",
    )


app.register("ready", on_ready)
