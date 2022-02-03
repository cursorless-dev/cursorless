from talon import Module, app
from ..csv_overrides import init_csv_and_watch_changes

mod = Module()


mod.list("cursorless_scope_type", desc="Supported scope types")

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://github.com/cursorless-dev/cursorless-vscode/blob/main/docs/user/customization.md
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
}


@mod.capture(rule="[every] {user.cursorless_scope_type}")
def cursorless_containing_scope(m) -> str:
    """Expand to containing scope"""
    return {
        "modifier": {
            "type": "containingScope",
            "scopeType": m.cursorless_scope_type,
            "includeSiblings": m[0] == "every",
        }
    }


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://github.com/cursorless-dev/cursorless-vscode/blob/main/docs/user/customization.md
selection_types = {
    "block": "paragraph",
    "cell": "notebookCell",
    "file": "document",
    "line": "line",
    "paint": "nonWhitespaceSequence",
    "link": "url",
    "token": "token",
}

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://github.com/cursorless-dev/cursorless-vscode/blob/main/docs/user/customization.md
subtoken_scope_types = {
    "word": "word",
    "char": "character",
}

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://github.com/cursorless-dev/cursorless-vscode/blob/main/docs/user/customization.md
# NB: This is a hack until we support having inside and outside on arbitrary
# scope types
surrounding_pair_scope_types = {
    "string": "string",
}

default_values = {
    "scope_type": scope_types,
    "selection_type": selection_types,
    "subtoken_scope_type": subtoken_scope_types,
    "surrounding_pair_scope_type": surrounding_pair_scope_types,
}


def on_ready():
    init_csv_and_watch_changes("modifier_scope_types", default_values)


app.register("ready", on_ready)
