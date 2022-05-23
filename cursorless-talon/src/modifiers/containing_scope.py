from typing import Any

from talon import Module, app

from ..csv_overrides import init_csv_and_watch_changes

mod = Module()


mod.list("cursorless_scope_type", desc="Supported scope types")

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
scope_types = {
    "arg": "argumentOrParameter",
    "attribute": "attribute",
    "call": "functionCall",
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
    "link": "url",
    "token": "token",
}


@mod.capture(rule="[every] {user.cursorless_scope_type}")
def cursorless_containing_scope(m) -> dict[str, Any]:
    """Expand to containing scope"""
    return {
        "type": "everyScope" if m[0] == "every" else "containingScope",
        "scopeType": {
            "type": m.cursorless_scope_type,
        },
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

default_values = {
    "scope_type": scope_types,
    "subtoken_scope_type": subtoken_scope_types,
    "surrounding_pair_scope_type": surrounding_pair_scope_types,
}


def on_ready():
    init_csv_and_watch_changes("modifier_scope_types", default_values)


app.register("ready", on_ready)
