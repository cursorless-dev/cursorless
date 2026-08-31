import {
  actionReferences,
  connectiveDefaultSpokenForms,
  graphemeDefaultSpokenForms,
  hatColorDefaultSpokenForms,
  hatShapeDefaultSpokenForms,
  lineDirectionDefaultSpokenForms,
  markDefaultSpokenForms,
  modifierReferences,
  pairedDelimiterReferences,
  scopeReferences,
} from "../references";
import type { SpokenFormEntry } from "../types/TalonSpokenForms";
import type { CheatsheetInfo, CheatsheetSection } from "./cheatsheet.types";

interface CheatsheetReference {
  defaultSpokenForm?: string;
  disabledByDefault?: boolean;
  private?: boolean;
  syntaxes: readonly {
    pattern: string;
    cheatsheet: string;
  }[];
}

type ReferenceMap = Readonly<Record<string, CheatsheetReference>>;

const REFERENCE_SPOKEN_FORM = "<spokenForm>";

const actionTypes = ["action"] as const;

type ReferenceKind = "action" | "modifier" | "scope";

export interface GetCheatsheetInfoOptions {
  spokenFormEntries?: readonly SpokenFormEntry[];
}

/** Construct the stock cheatsheet directly from the canonical references. */
export function getDefaultCheatsheetInfo(): CheatsheetInfo {
  return getCheatsheetInfo();
}

/** Construct a cheatsheet using optional customized Talon spoken forms. */
export function getCheatsheetInfo({
  spokenFormEntries = [],
}: GetCheatsheetInfoOptions = {}): CheatsheetInfo {
  const resolver = new SpokenFormResolver(spokenFormEntries);

  return {
    sections: [
      referenceSection(
        resolver,
        "Actions",
        "actions",
        "action",
        "action",
        actionReferences,
      ),
      colorsSection(resolver),
      compoundTargetsSection(resolver),
      destinationsSection(resolver),
      referenceSection(
        resolver,
        "Modifiers",
        "modifiers",
        "modifier",
        "modifier",
        modifierReferences,
        {
          endOf: "end",
          everyScope: "every",
          startOf: "start",
        },
      ),
      pairedDelimitersSection(resolver),
      scopeVisualizerSection(resolver),
      referenceSection(
        resolver,
        "Scopes",
        "scopes",
        "scopeType",
        "scope",
        scopeReferences,
        {
          surroundingPair: "pair",
        },
      ),
      shapesSection(resolver),
      specialMarksSection(resolver),
      tutorialSection,
    ],
  };
}

function referenceSection(
  resolver: SpokenFormResolver,
  name: string,
  id: string,
  type: string,
  referenceKind: ReferenceKind,
  references: ReferenceMap,
  itemIdOverrides: Readonly<Record<string, string>> = {},
): CheatsheetSection {
  return {
    name,
    id,
    items: Object.entries(references)
      .filter(([, reference]) => !reference.private)
      .map(([referenceId, reference]) => {
        const spokenForms = getReferenceSpokenForms(
          resolver,
          referenceKind,
          referenceId,
          reference.defaultSpokenForm,
          !reference.disabledByDefault,
        );
        const replacements = getSyntaxReplacements(resolver);

        return {
          id: itemIdOverrides[referenceId] ?? referenceId,
          type,
          variations: reference.syntaxes.flatMap(({ pattern, cheatsheet }) =>
            spokenForms.flatMap((spokenForm) =>
              applyReplacements(
                pattern.replaceAll(
                  REFERENCE_SPOKEN_FORM,
                  reference.defaultSpokenForm ?? REFERENCE_SPOKEN_FORM,
                ),
                [
                  ...replacements,
                  ...(reference.defaultSpokenForm == null || spokenForm == null
                    ? []
                    : ([[reference.defaultSpokenForm, [spokenForm]]] as const)),
                ],
              ).map((customPattern) => ({
                spokenForm: customPattern,
                description: cheatsheet,
              })),
            ),
          ),
        };
      })
      .filter(({ variations }) => variations.length > 0),
  };
}

class SpokenFormResolver {
  private entries = new Map<string, readonly string[]>();

  constructor(spokenFormEntries: readonly SpokenFormEntry[]) {
    for (const { type, id, spokenForms } of spokenFormEntries) {
      this.entries.set(`${type}\0${id}`, spokenForms);
    }
  }

  get(
    types: readonly string[],
    id: string,
    defaultSpokenForms: readonly string[],
  ): readonly string[] {
    const matches = types.flatMap(
      (type) => this.entries.get(`${type}\0${id}`) ?? [],
    );
    const hasEntry = types.some((type) => this.entries.has(`${type}\0${id}`));

    return hasEntry ? matches : defaultSpokenForms;
  }
}

function getReferenceSpokenForms(
  resolver: SpokenFormResolver,
  kind: ReferenceKind,
  id: string,
  defaultSpokenForm: string | undefined,
  enabledByDefault: boolean,
): readonly (string | undefined)[] {
  if (defaultSpokenForm == null) {
    return [undefined];
  }

  if (kind === "action") {
    const talonId = id === "rewrapWithPairedDelimiter" ? "rewrap" : id;
    return resolver.get(
      actionTypes,
      talonId,
      enabledByDefault ? [defaultSpokenForm] : [],
    );
  }

  if (kind === "scope") {
    const types =
      id === "glyph" ? ["complexScopeTypeType"] : ["simpleScopeTypeType"];
    return resolver.get(types, id, enabledByDefault ? [defaultSpokenForm] : []);
  }

  const definition = modifierSpokenFormDefinitions[id];
  const defaultSpokenForms = enabledByDefault ? [defaultSpokenForm] : [];
  if (definition == null) {
    return defaultSpokenForms;
  }

  return resolver.get(definition.types, definition.id, defaultSpokenForms);
}

const modifierSpokenFormDefinitions: Readonly<
  Record<string, { types: readonly string[]; id: string }>
> = {
  everyScope: { types: ["every_scope_modifier"], id: "every" },
  ancestor: { types: ["ancestor_scope_modifier"], id: "ancestor" },
  interiorOnly: { types: ["interior_modifier"], id: "interiorOnly" },
  excludeInterior: { types: ["simple_modifier"], id: "excludeInterior" },
  leading: { types: ["simple_modifier"], id: "leading" },
  trailing: { types: ["simple_modifier"], id: "trailing" },
  extendThroughStartOf: {
    types: ["head_tail_modifier"],
    id: "extendThroughStartOf",
  },
  extendThroughEndOf: {
    types: ["head_tail_modifier"],
    id: "extendThroughEndOf",
  },
  startOf: { types: ["position"], id: "start" },
  endOf: { types: ["position"], id: "end" },
  visible: { types: ["simple_modifier"], id: "visible" },
  keepContentFilter: {
    types: ["simple_modifier"],
    id: "keepContentFilter",
  },
  keepEmptyFilter: {
    types: ["simple_modifier"],
    id: "keepEmptyFilter",
  },
  toRawSelection: { types: ["simple_modifier"], id: "toRawSelection" },
  inferPreviousMark: {
    types: ["simple_modifier"],
    id: "inferPreviousMark",
  },
};

type SyntaxReplacement = readonly [string, readonly string[]];

function getSyntaxReplacements(
  resolver: SpokenFormResolver,
): readonly SyntaxReplacement[] {
  return [
    replacement(
      connectiveDefaultSpokenForms.swapConnective,
      resolver,
      ["swap_connective"],
      "swapConnective",
    ),
    replacement(
      connectiveDefaultSpokenForms.first,
      resolver,
      ["first_modifier"],
      "first",
    ),
    replacement(
      connectiveDefaultSpokenForms.last,
      resolver,
      ["last_modifier"],
      "last",
    ),
    replacement(
      connectiveDefaultSpokenForms.previous,
      resolver,
      ["previous_next_modifier"],
      "previous",
    ),
    replacement(
      connectiveDefaultSpokenForms.next,
      resolver,
      ["previous_next_modifier"],
      "next",
    ),
    replacement(
      connectiveDefaultSpokenForms.forward,
      resolver,
      ["forward_backward_modifier"],
      "forward",
    ),
    replacement(
      connectiveDefaultSpokenForms.backward,
      resolver,
      ["forward_backward_modifier"],
      "backward",
    ),
    replacement(
      modifierReferences.everyScope.defaultSpokenForm,
      resolver,
      ["every_scope_modifier"],
      "every",
    ),
    replacement(
      scopeReferences.token.defaultSpokenForm,
      resolver,
      ["simpleScopeTypeType"],
      "token",
    ),
  ];
}

function replacement(
  defaultSpokenForm: string,
  resolver: SpokenFormResolver,
  types: readonly string[],
  id: string,
): SyntaxReplacement {
  return [defaultSpokenForm, resolver.get(types, id, [defaultSpokenForm])];
}

function applyReplacements(
  pattern: string,
  replacements: readonly SyntaxReplacement[],
): string[] {
  let patterns = [pattern];

  for (const [defaultSpokenForm, spokenForms] of replacements) {
    const replacedPatterns: string[] = [];
    for (const currentPattern of patterns) {
      if (!termRegex(defaultSpokenForm).test(currentPattern)) {
        replacedPatterns.push(currentPattern);
        continue;
      }

      for (const spokenForm of spokenForms) {
        replacedPatterns.push(
          replaceTerm(currentPattern, defaultSpokenForm, spokenForm),
        );
      }
    }
    patterns = replacedPatterns;
  }

  return patterns;
}

function replaceTerm(pattern: string, from: string, to: string): string {
  return pattern.replaceAll(termRegex(from), to);
}

function termRegex(term: string): RegExp {
  const escaped = term.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
  return new RegExp(`(?<!\\S)${escaped}(?!\\S)`, "gu");
}

function pairedDelimitersSection(
  resolver: SpokenFormResolver,
): CheatsheetSection {
  return {
    name: "Paired delimiters",
    id: "pairedDelimiters",
    items: Object.entries(pairedDelimiterReferences)
      .filter(([, reference]) => !("private" in reference && reference.private))
      .map(([id, reference]) => ({
        id,
        type: "pairedDelimiter",
        variations: resolver
          .get(
            ["pairedDelimiter"],
            id,
            "disabledByDefault" in reference && reference.disabledByDefault
              ? []
              : [reference.defaultSpokenForm],
          )
          .map((spokenForm) => ({
            spokenForm,
            description: capitalize(reference.name),
          })),
      }))
      .filter(({ variations }) => variations.length > 0),
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function colorsSection(resolver: SpokenFormResolver): CheatsheetSection {
  const defaultEnabledIds = new Set(["blue", "green", "pink", "red", "yellow"]);
  return {
    name: "Colors",
    id: "colors",
    items: Object.entries(hatColorDefaultSpokenForms)
      .filter(([id, spokenForm]) => id !== "default" && spokenForm != null)
      .map(([id, defaultSpokenForm]) => ({
        id,
        type: "hatColor",
        variations: resolver
          .get(
            ["hat_color"],
            id,
            defaultEnabledIds.has(id)
              ? [requiredSpokenForm(defaultSpokenForm)]
              : [],
          )
          .map((spokenForm) => ({
            spokenForm,
            description: capitalize(id),
          })),
      }))
      .filter(({ variations }) => variations.length > 0),
  };
}

function requiredSpokenForm(spokenForm: string | null): string {
  if (spokenForm == null) {
    throw new Error("Expected a default spoken form");
  }

  return spokenForm;
}

function compoundTargetsSection(
  resolver: SpokenFormResolver,
): CheatsheetSection {
  return {
    name: "Compound targets",
    id: "compoundTargets",
    items: [
      {
        id: "listConnective",
        types: ["list_connective"],
        spokenForm: connectiveDefaultSpokenForms.listConnective,
        descriptions: ["<target 1> and <target 2>"],
      },
      {
        id: "rangeExclusive",
        types: ["range_connective"],
        spokenForm: connectiveDefaultSpokenForms.rangeExclusive,
        descriptions: [
          "between <target 1> and <target 2>",
          "between selection and <target>",
        ],
      },
      {
        id: "rangeInclusive",
        types: ["range_connective"],
        spokenForm: connectiveDefaultSpokenForms.rangeInclusive,
        descriptions: [
          "<target 1> through <target 2>",
          "selection through <target>",
        ],
      },
      {
        id: "rangeExcludingStart",
        types: ["range_connective"],
        spokenForm: connectiveDefaultSpokenForms.rangeExcludingStart,
        descriptions: [
          "end of <target 1> through <target 2>",
          "end of selection through <target>",
        ],
      },
      {
        id: "rangeExcludingEnd",
        types: ["range_connective"],
        spokenForm: connectiveDefaultSpokenForms.rangeExcludingEnd,
        descriptions: [
          "<target 1> until start of <target 2>",
          "selection until start of <target>",
        ],
      },
      {
        id: "verticalRange",
        types: ["range_type"],
        spokenForm: connectiveDefaultSpokenForms.verticalRange,
        descriptions: [
          "<target 1> vertically through <target 2>",
          "selection vertically through <target>",
        ],
      },
    ]
      .map(({ id, types, spokenForm, descriptions }) => {
        let defaultSpokenForms: string[];
        if (spokenForm != null) {
          defaultSpokenForms = [spokenForm];
        } else {
          defaultSpokenForms = [];
        }

        return {
          id,
          type: "compoundTargetConnective",
          variations: resolver
            .get(types, id, defaultSpokenForms)
            .flatMap((customSpokenForm) =>
              descriptions.map((description, index) => ({
                spokenForm:
                  index === 0
                    ? `<target 1> ${customSpokenForm} <target 2>`
                    : `${customSpokenForm} <target>`,
                description,
              })),
            ),
        };
      })
      .filter(({ variations }) => variations.length > 0),
  };
}

function destinationsSection(resolver: SpokenFormResolver): CheatsheetSection {
  return {
    name: "Destinations",
    id: "destinations",
    items: [
      {
        id: "destination_after",
        types: ["insertion_mode_before_after"],
        valueId: "after",
        spokenForm: connectiveDefaultSpokenForms.after,
        description: "Insert after <target>",
      },
      {
        id: "destination_before",
        types: ["insertion_mode_before_after"],
        valueId: "before",
        spokenForm: connectiveDefaultSpokenForms.before,
        description: "Insert before <target>",
      },
      {
        id: "destination_to",
        types: ["insertion_mode_to"],
        valueId: "sourceDestinationConnective",
        spokenForm: connectiveDefaultSpokenForms.sourceDestinationConnective,
        description: "Replace <target>",
      },
    ]
      .map(({ id, types, valueId, spokenForm, description }) => ({
        id,
        type: "destination",
        variations: resolver
          .get(types, valueId, [spokenForm])
          .map((customSpokenForm) => ({
            spokenForm: `${customSpokenForm} <target>`,
            description,
          })),
      }))
      .filter(({ variations }) => variations.length > 0),
  };
}

function scopeVisualizerSection(
  resolver: SpokenFormResolver,
): CheatsheetSection {
  const showSpokenForms = resolver.get(
    ["show_scope_visualizer"],
    "showScopeVisualizer",
    ["visualize"],
  );
  return {
    name: "Scope visualizer",
    id: "scopeVisualizer",
    items: [
      items(
        "hideScopeVisualizer",
        "command",
        resolver.get(["hide_scope_visualizer"], "hideScopeVisualizer", [
          "visualize nothing",
        ]),
        "Hide scope visualizer",
      ),
      item(
        "show_scope_sidebar",
        "command",
        "bar cursorless",
        "Show cursorless sidebar",
      ),
      {
        id: "show_scope_visualizer",
        type: "command",
        variations: showSpokenForms.flatMap((showSpokenForm) => [
          {
            spokenForm: `${showSpokenForm} <scope>`,
            description: "Visualize <scope>",
          },
          ...["removal", "iteration"].flatMap((visualizationType) =>
            resolver
              .get(["visualization_type"], visualizationType, [
                visualizationType,
              ])
              .map((spokenForm) => ({
                spokenForm: `${showSpokenForm} <scope> ${spokenForm}`,
                description: `Visualize <scope> ${visualizationType} range`,
              })),
          ),
        ]),
      },
    ].filter(({ variations }) => variations.length > 0),
  };
}

function shapesSection(resolver: SpokenFormResolver): CheatsheetSection {
  return {
    name: "Shapes",
    id: "shapes",
    items: Object.entries(hatShapeDefaultSpokenForms)
      .filter(([id, spokenForm]) => id !== "default" && spokenForm != null)
      .map(([id]) => ({
        id,
        type: "hatShape",
        variations: resolver.get(["hat_shape"], id, []).map((spokenForm) => ({
          spokenForm,
          description: capitalize(id),
        })),
      }))
      .filter(({ variations }) => variations.length > 0),
  };
}

function specialMarksSection(resolver: SpokenFormResolver): CheatsheetSection {
  return {
    name: "Special marks",
    id: "specialMarks",
    items: [
      items(
        "currentSelection",
        "mark",
        resolver.get(["simple_mark"], "currentSelection", [
          markDefaultSpokenForms.cursor,
        ]),
        "Current selection",
      ),
      items(
        "lineNumberModulo100",
        "mark",
        resolver
          .get(["line_direction"], "lineNumberModulo100", [
            lineDirectionDefaultSpokenForms.modulo100,
          ])
          .map((spokenForm) => `${spokenForm} <number>`),
        "Line number modulo 100",
      ),
      items(
        "lineNumberRelativeDown",
        "mark",
        resolver
          .get(["line_direction"], "lineNumberRelativeDown", [
            lineDirectionDefaultSpokenForms.relativeDown,
          ])
          .map((spokenForm) => `${spokenForm} <number>`),
        "Line number down from cursor",
      ),
      items(
        "lineNumberRelativeUp",
        "mark",
        resolver
          .get(["line_direction"], "lineNumberRelativeUp", [
            lineDirectionDefaultSpokenForms.relativeUp,
          ])
          .map((spokenForm) => `${spokenForm} <number>`),
        "Line number up from cursor",
      ),
      items(
        "nothing",
        "mark",
        resolver.get(["simple_mark"], "nothing", [
          markDefaultSpokenForms.nothing,
        ]),
        "Nothing",
      ),
      items(
        "previousSource",
        "mark",
        resolver.get(["simple_mark"], "previousSource", [
          markDefaultSpokenForms.source,
        ]),
        "Previous source",
      ),
      items(
        "previousTarget",
        "mark",
        resolver.get(["simple_mark"], "previousTarget", [
          markDefaultSpokenForms.that,
        ]),
        "Previous target",
      ),
      items(
        "unknownSymbol",
        "mark",
        resolver.get(["unknown_symbol"], "unknownSymbol", [
          graphemeDefaultSpokenForms["\uFFFD"],
        ]),
        "Unknown symbol",
      ),
    ].filter(({ variations }) => variations.length > 0),
  };
}

const tutorialSection: CheatsheetSection = {
  name: "Tutorial",
  id: "tutorial",
  items: [
    item(
      "start_tutorial",
      "command",
      "cursorless tutorial",
      "Start the introductory Cursorless tutorial",
    ),
    item("tutorial_close", "command", "tutorial close", "Close the tutorial"),
    item(
      "tutorial_list",
      "command",
      "tutorial list",
      "List all available tutorials",
    ),
    item(
      "tutorial_next",
      "command",
      "tutorial next",
      "Advance to next step in tutorial",
    ),
    item(
      "tutorial_previous",
      "command",
      "tutorial previous",
      "Go back to previous step in tutorial",
    ),
    item(
      "tutorial_restart",
      "command",
      "tutorial restart",
      "Restart the tutorial",
    ),
    item(
      "tutorial_resume",
      "command",
      "tutorial resume",
      "Resume the tutorial",
    ),
    item(
      "tutorial_start_by_number",
      "command",
      "tutorial <number>",
      "Start a specific tutorial by number",
    ),
  ],
};

function item(
  id: string,
  type: string,
  spokenForm: string,
  description: string,
): CheatsheetSection["items"][number] {
  return { id, type, variations: [{ spokenForm, description }] };
}

function items(
  id: string,
  type: string,
  spokenForms: readonly string[],
  description: string,
): CheatsheetSection["items"][number] {
  return {
    id,
    type,
    variations: spokenForms.map((spokenForm) => ({ spokenForm, description })),
  };
}
