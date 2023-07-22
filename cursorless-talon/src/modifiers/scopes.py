from talon import Module, app

from ..csv_overrides import SPOKEN_FORM_HEADER, init_csv_and_watch_changes

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
    "instance": "instance",
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
    "branch": "branch",
    "type": "type",
    "value": "value",
    "condition": "condition",
    "unit": "unit",
    #  XML, JSX
    "element": "xmlElement",
    "tags": "xmlBothTags",
    "start tag": "xmlStartTag",
    "end tag": "xmlEndTag",
    # LaTeX
    "part": "part",
    "chapter": "chapter",
    "subsection": "subSection",
    "subsubsection": "subSubSection",
    "paragraph": "namedParagraph",
    "subparagraph": "subParagraph",
    "environment": "environment",
    # Talon
    "command": "command",
    # Text-based scope types
    "char": "character",
    "word": "word",
    "token": "token",
    "identifier": "identifier",
    "line": "line",
    "sentence": "sentence",
    "block": "paragraph",
    "file": "document",
    "paint": "nonWhitespaceSequence",
    "short paint": "boundedNonWhitespaceSequence",
    "link": "url",
    "cell": "notebookCell",
}


@mod.capture(
    rule="{user.cursorless_scope_type} | {user.cursorless_custom_regex_scope_type}"
)
def cursorless_scope_type(m) -> dict[str, str]:
    """Cursorless scope type singular"""
    try:
        return {"type": m.cursorless_scope_type}
    except AttributeError:
        return {"type": "customRegex", "regex": m.cursorless_custom_regex_scope_type}


@mod.capture(
    rule="{user.cursorless_scope_type_plural} | {user.cursorless_custom_regex_scope_type_plural}"
)
def cursorless_scope_type_plural(m) -> dict[str, str]:
    """Cursorless scope type plural"""
    try:
        return {"type": m.cursorless_scope_type_plural}
    except AttributeError:
        return {
            "type": "customRegex",
            "regex": m.cursorless_custom_regex_scope_type_plural,
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
            "surrounding_pair_scope_type": surrounding_pair_scope_types,
        },
        pluralize_lists=["scope_type"],
    )
    init_csv_and_watch_changes(
        "experimental/regex_scope_types",
        {},
        headers=[SPOKEN_FORM_HEADER, "Regex"],
        allow_unknown_values=True,
        default_list_name="custom_regex_scope_type",
        pluralize_lists=["custom_regex_scope_type"],
    )


app.register("ready", on_ready)
