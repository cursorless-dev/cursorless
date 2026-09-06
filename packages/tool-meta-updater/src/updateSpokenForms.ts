import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { DefaultSpokenFormMapEntry } from "@cursorless/lib-common";
import {
  defaultSpokenFormMapCore,
  simpleActionNames,
} from "@cursorless/lib-common";

type SpokenFormEntries = Record<string, string>;
type SpokenFormLists = Record<string, SpokenFormEntries>;
type DefaultSpokenForms = Readonly<
  Record<string, string | DefaultSpokenFormMapEntry>
>;

const NOTE =
  "Please don't edit this json file; see https://www.cursorless.org/docs/user/customization";

const actionListIds = {
  callback_action: ["nextHomophone"],
  paste_action: ["pasteFromClipboard"],
  bring_move_action: ["replaceWithTarget", "moveToTarget"],
  swap_action: ["swapTargets"],
  wrap_action: ["wrapWithPairedDelimiter", "rewrapWithPairedDelimiter"],
  insert_snippet_action: ["insertSnippet"],
  reformat_action: ["applyFormatter"],
  call_action: ["callAsFunction"],
} as const;

const nonSimpleActionIds = new Set<string>(Object.values(actionListIds).flat());

const modifierListIds = {
  simple_modifier: [
    "excludeInterior",
    "toRawSelection",
    "leading",
    "trailing",
    "keepContentFilter",
    "keepEmptyFilter",
    "inferPreviousMark",
    "visible",
  ],
  every_scope_modifier: ["everyScope"],
  interior_modifier: ["interiorOnly"],
  head_tail_modifier: ["extendThroughStartOf", "extendThroughEndOf"],
} as const;

const modifierExtraListIds = {
  ancestor_scope_modifier: ["ancestor"],
  first_modifier: ["first"],
  last_modifier: ["last"],
  previous_next_modifier: ["previous", "next"],
  forward_backward_modifier: ["forward", "backward"],
} as const;

const pairedDelimiterListIds = {
  selectable_only_paired_delimiter: ["any"],
  wrapper_only_paired_delimiter: ["whitespace"],
  wrapper_selectable_paired_delimiter: [
    "curlyBrackets",
    "angleBrackets",
    "escapedDoubleQuotes",
    "escapedSingleQuotes",
    "escapedParentheses",
    "escapedSquareBrackets",
    "doubleQuotes",
    "parentheses",
    "backtickQuotes",
    "squareBrackets",
    "singleQuotes",
  ],
} as const;

export function updateSpokenForms(
  _actual: object | null,
  options: FormatPluginFnOptions,
): object | null {
  if (options.manifest.name !== "cursorless") {
    return null;
  }

  const map = defaultSpokenFormMapCore;
  const simpleActionIds = simpleActionNames.filter(
    (id) =>
      id !== "experimental.setInstanceReference" && !nonSimpleActionIds.has(id),
  );

  return {
    "NOTE FOR USERS": NOTE,
    "actions.csv": {
      simple_action: entries(
        map.action,
        [...simpleActionIds, "generateSnippet", "highlight"],
        { sort: true },
      ),
      ...lists(map.action, actionListIds, {
        rewrapWithPairedDelimiter: "rewrap",
      }),
    },
    "target_connectives.csv": {
      range_connective: entries(map.connective, [
        "rangeExclusive",
        "rangeInclusive",
        "rangeExcludingStart",
        "rangeExcludingEnd",
      ]),
      list_connective: entries(map.connective, ["listConnective"]),
      swap_connective: entries(map.connective, ["swapConnective"]),
      insertion_mode_to: entries(map.insertionMode, ["to"], {
        idRewrites: { to: "sourceDestinationConnective" },
      }),
    },
    "modifiers.csv": {
      ...lists(map.simpleModifier, modifierListIds, {
        everyScope: "every",
      }),
      range_type: entries(map.connective, ["verticalRange"]),
      ...lists(map.modifierExtra, modifierExtraListIds),
    },
    "positions.csv": {
      position_modifier: entries(map.simpleModifier, ["startOf", "endOf"], {
        idRewrites: {
          startOf: "start",
          endOf: "end",
        },
      }),
      insertion_mode_before_after: entries(map.insertionMode, [
        "before",
        "after",
      ]),
    },
    "modifier_scope_types.csv": {
      scope_type: entries(
        map.simpleScopeTypeType,
        Object.keys(map.simpleScopeTypeType).filter((id) => id !== "string"),
      ),
      surrounding_pair_scope_type: entries(map.pairedDelimiter, ["string"]),
      glyph_scope_type: entries(map.complexScopeTypeType, ["glyph"]),
    },
    "paired_delimiters.csv": lists(map.pairedDelimiter, pairedDelimiterListIds),
    "special_marks.csv": {
      simple_mark: entries(map.specialMark, [
        "currentSelection",
        "previousTarget",
        "previousSource",
        "nothing",
      ]),
      unknown_symbol: entries(map.specialMark, ["unknownSymbol"]),
      line_direction: entries(map.specialMark, [
        "lineNumberModulo100",
        "lineNumberRelativeUp",
        "lineNumberRelativeDown",
      ]),
    },
    "scope_visualizer.csv": {
      show_scope_visualizer: entries(map.scopeVisualizer, [
        "showScopeVisualizer",
      ]),
      hide_scope_visualizer: entries(map.scopeVisualizer, [
        "hideScopeVisualizer",
      ]),
      visualization_type: entries(map.scopeVisualizer, [
        "removal",
        "iteration",
      ]),
    },
    "experimental/experimental_actions.csv": {
      experimental_action: entries(map.action, [
        "experimental.setInstanceReference",
      ]),
    },
    "experimental/actions_custom.csv": {},
    "experimental/regex_scope_types.csv": {},
    "hat_styles.csv": {
      hat_color: entries(map.hatColor, Object.keys(map.hatColor), {
        dontDisableSpokenForms: true,
      }),
      hat_shape: entries(map.hatShape, Object.keys(map.hatShape), {
        dontDisableSpokenForms: true,
      }),
    },
  };
}

function lists(
  map: DefaultSpokenForms,
  listIds: Readonly<Record<string, readonly string[]>>,
  idRewrites: Readonly<Record<string, string>> = {},
): SpokenFormLists {
  return Object.fromEntries(
    Object.entries(listIds).map(([listName, ids]) => [
      listName,
      entries(map, ids, { idRewrites }),
    ]),
  );
}

function entries(
  map: DefaultSpokenForms,
  ids: readonly string[],
  options: {
    dontDisableSpokenForms?: boolean;
    sort?: boolean;
    idRewrites?: Readonly<Record<string, string>>;
  } = {},
): SpokenFormEntries {
  const entries = ids.flatMap((id) => {
    const value = map[id];

    if (value == null) {
      throw new Error(`No default spoken form found for '${id}'`);
    }

    if (typeof value !== "string" && value.visibility === "private") {
      return [];
    }

    const spokenForms =
      typeof value === "string" ? [value] : value.defaultSpokenForms;
    const prefix =
      typeof value === "string" ||
      value.visibility == null ||
      options.dontDisableSpokenForms
        ? ""
        : "-";
    const spokenForm = `${prefix}${spokenForms.join("|")}`;
    const resolvedId = options.idRewrites?.[id] ?? id;
    return [[spokenForm, resolvedId]];
  });

  if (options.sort) {
    entries.sort((a, b) => a[0].localeCompare(b[0]));
  }

  return Object.fromEntries(entries);
}
