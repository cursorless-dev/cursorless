from talon import Context, scope

from .csv_overrides import csv_get_ctx, csv_get_normalized_ctx


def init_scope_spoken_forms(graphemes_talon_list: dict[str, str]):
    create_flattened_talon_list(csv_get_ctx(), graphemes_talon_list)
    if is_cursorless_test_mode():
        create_flattened_talon_list(csv_get_normalized_ctx(), graphemes_talon_list)


def create_flattened_talon_list(ctx: Context, graphemes_talon_list: dict[str, str]):
    lists_to_merge = {
        "cursorless_scope_type": "simple",
        "cursorless_selectable_only_paired_delimiter": "surroundingPair",
        "cursorless_wrapper_selectable_paired_delimiter": "surroundingPair",
        "cursorless_surrounding_pair_scope_type": "surroundingPair",
    }
    # If the user have no custom regex scope type, then that list is missing from the context
    if "user.cursorless_custom_regex_scope_type" in ctx.lists.keys():  # noqa: SIM118
        lists_to_merge["cursorless_custom_regex_scope_type"] = "customRegex"

    scope_types_singular: dict[str, str] = {}
    scope_types_plural: dict[str, str] = {}

    for list_name, prefix in lists_to_merge.items():
        for key, value in ctx.lists[f"user.{list_name}"].items():
            scope_types_singular[key] = f"{prefix}.{value}"
        for key, value in ctx.lists[f"user.{list_name}_plural"].items():
            scope_types_plural[key] = f"{prefix}.{value}"

    glyph_singular_spoken_forms = ctx.lists["user.cursorless_glyph_scope_type"]
    glyph_plural_spoken_forms = ctx.lists["user.cursorless_glyph_scope_type_plural"]

    for grapheme_key, grapheme_value in graphemes_talon_list.items():
        value = f"glyph.{grapheme_value}"
        for glyph in glyph_singular_spoken_forms:
            key = f"{glyph} {grapheme_key}"
            scope_types_singular[key] = value
        for glyph in glyph_plural_spoken_forms:
            key = f"{glyph} {grapheme_key}"
            scope_types_plural[key] = value

    ctx.lists["user.cursorless_scope_type_flattened"] = scope_types_singular
    ctx.lists["user.cursorless_scope_type_flattened_plural"] = scope_types_plural


def is_cursorless_test_mode():
    return "user.cursorless_spoken_form_test" in scope.get("mode")
