from talon import Context

from .csv_overrides import csv_get_ctx, csv_get_normalized_ctx


def init_scope_spoken_forms(graphemes_talon_list: dict[str, str]):
    create_flattened_talon_list(csv_get_ctx(), graphemes_talon_list, True)
    create_flattened_talon_list(csv_get_normalized_ctx(), graphemes_talon_list, False)


def create_flattened_talon_list(
    ctx: Context, graphemes_talon_list: dict[str, str], include_custom_regex: bool
):
    scope_types_singular: dict[str, str] = {}
    scope_types_plural: dict[str, str] = {}

    append_talon_lists(
        ctx, scope_types_singular, scope_types_plural, "simple", "cursorless_scope_type"
    )
    append_talon_lists(
        ctx,
        scope_types_singular,
        scope_types_plural,
        "surroundingPair",
        "cursorless_surrounding_pair_scope_type",
    )
    append_talon_lists(
        ctx,
        scope_types_singular,
        scope_types_plural,
        "surroundingPair",
        "cursorless_selectable_only_paired_delimiter",
    )
    append_talon_lists(
        ctx,
        scope_types_singular,
        scope_types_plural,
        "surroundingPair",
        "cursorless_wrapper_selectable_paired_delimiter",
    )
    if include_custom_regex:
        append_talon_lists(
            ctx,
            scope_types_singular,
            scope_types_plural,
            "customRegex",
            "cursorless_custom_regex_scope_type",
        )

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


def append_talon_lists(
    ctx: Context,
    target_singular: dict[str, str],
    target_plural: dict[str, str],
    prefix: str,
    list_name: str,
):
    for key, value in ctx.lists[f"user.{list_name}"].items():
        target_singular[key] = f"{prefix}.{value}"
    for key, value in ctx.lists[f"user.{list_name}_plural"].items():
        target_plural[key] = f"{prefix}.{value}"
