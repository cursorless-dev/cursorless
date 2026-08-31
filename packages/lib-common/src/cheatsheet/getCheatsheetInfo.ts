import {
  actionReferences,
  connectiveDefaultSpokenForms,
  defaultSpokenFormMapCore,
  hatColorDefaultSpokenForms,
  hatShapeDefaultSpokenForms,
  modifierExtraReferences,
  modifierReferences,
  pairedDelimiterReferences,
  scopeReferences,
} from "../references";
import type {
  DefaultSpokenFormMapDefinition,
  DefaultSpokenFormMapEntry,
} from "../types/DefaultSpokenFormMap";
import type { SpokenFormEntry } from "../types/TalonSpokenForms";
import { camelCaseToAllDown, capitalize } from "../util/stringUtils";
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

/** Construct the stock cheatsheet directly from the canonical references. */
export function getDefaultCheatsheetInfo(): CheatsheetInfo {
  return constructCheatsheetInfo(
    getDefaultSpokenFormEntries(defaultSpokenFormMapCore),
  );
}

/** Construct a cheatsheet using optional customized Talon spoken forms. */
export function getCheatsheetInfo(
  spokenFormEntries: readonly SpokenFormEntry[],
): CheatsheetInfo {
  return constructCheatsheetInfo(spokenFormEntries);
}

function constructCheatsheetInfo(
  spokenFormEntries: readonly SpokenFormResolverEntry[],
): CheatsheetInfo {
  const resolver = new SpokenFormResolver(spokenFormEntries);

  return {
    sections: [
      actionsSection(resolver, spokenFormEntries),
      destinationsSection(resolver),
      scopesSection(resolver, spokenFormEntries),
      scopeVisualizerSection(resolver),
      referenceSection(
        resolver,
        "Modifiers",
        "modifiers",
        "modifier",
        "modifier",
        modifierReferences,
      ),
      pairedDelimitersSection(resolver),
      specialMarksSection(resolver),
      compoundTargetsSection(resolver),
      colorsSection(resolver),
      shapesSection(resolver),
      tutorialSection,
    ],
  };
}

function actionsSection(
  resolver: SpokenFormResolver,
  spokenFormEntries: readonly SpokenFormResolverEntry[],
): CheatsheetSection {
  const section = referenceSection(
    resolver,
    "Actions",
    "actions",
    "action",
    "action",
    actionReferences,
  );

  return {
    ...section,
    items: [
      ...section.items,
      ...spokenFormEntries
        .filter(({ type }) => type === "customAction")
        .map(({ id, spokenForms }) =>
          items(
            id,
            "action",
            spokenForms
              .slice(0, 1)
              .map((spokenForm) => `${spokenForm} <target>`),
            makeReadable(id),
          ),
        )
        .filter(({ variations }) => variations.length > 0),
    ],
  };
}

function scopesSection(
  resolver: SpokenFormResolver,
  spokenFormEntries: readonly SpokenFormResolverEntry[],
): CheatsheetSection {
  const section = referenceSection(
    resolver,
    "Scopes",
    "scopes",
    "scopeType",
    "scope",
    scopeReferences,
  );

  return {
    ...section,
    items: [
      ...section.items,
      ...spokenFormEntries
        .filter(({ type }) => type === "customRegex")
        .flatMap(({ id }) => {
          const spokenForms = resolver.get(["customRegex"], id);
          if (spokenForms.length === 0) {
            return [];
          }
          return [
            items(
              `customRegex.${spokenForms[0]}`,
              "scopeType",
              spokenForms,
              `/${id}/`,
            ),
          ];
        }),
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
): CheatsheetSection {
  return {
    name,
    id,
    items: Object.entries(references)
      .map(([referenceId, reference]) => {
        const spokenForms = getReferenceSpokenForms(
          resolver,
          referenceKind,
          referenceId,
          reference.defaultSpokenForm,
        );
        const replacements = getSyntaxReplacements(resolver);

        return {
          id: referenceId,
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
                description: reference.private
                  ? `${cheatsheet} (PRIVATE)`
                  : cheatsheet,
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

  constructor(spokenFormEntries: readonly SpokenFormResolverEntry[]) {
    for (const { type, id, spokenForms } of spokenFormEntries) {
      this.entries.set(`${type}\0${id}`, spokenForms);
    }
  }

  get(types: readonly string[], id: string): readonly string[] {
    return types
      .flatMap((type) => this.entries.get(`${type}\0${id}`) ?? [])
      .slice(0, 1);
  }
}

interface SpokenFormResolverEntry {
  type: string;
  id: string;
  spokenForms: readonly string[];
}

function getDefaultSpokenFormEntries(
  spokenFormMap: DefaultSpokenFormMapDefinition,
): SpokenFormResolverEntry[] {
  return Object.entries(spokenFormMap).flatMap(([type, entries]) =>
    Object.entries(
      entries as Readonly<Record<string, string | DefaultSpokenFormMapEntry>>,
    ).map(([id, value]) => ({
      type,
      id,
      spokenForms: getEnabledDefaultSpokenForms(value),
    })),
  );
}

function getEnabledDefaultSpokenForms(
  value: string | DefaultSpokenFormMapEntry,
): readonly string[] {
  if (typeof value === "string") {
    return [value];
  }

  return value.isDisabledByDefault ? [] : value.defaultSpokenForms;
}

function getReferenceSpokenForms(
  resolver: SpokenFormResolver,
  kind: ReferenceKind,
  id: string,
  defaultSpokenForm: string | undefined,
): readonly (string | undefined)[] {
  if (defaultSpokenForm == null) {
    return [undefined];
  }

  if (kind === "action") {
    return resolver.get(actionTypes, id);
  }

  if (kind === "scope") {
    const types =
      id === "glyph" ? ["complexScopeTypeType"] : ["simpleScopeTypeType"];
    return resolver.get(types, id);
  }

  const definition = modifierSpokenFormDefinitions[id];
  if (definition == null) {
    return [];
  }

  return resolver.get(definition.types, definition.id);
}

const modifierSpokenFormDefinitions: Readonly<
  Record<string, { types: readonly string[]; id: string }>
> = {
  everyScope: { types: ["simpleModifier"], id: "everyScope" },
  ancestor: { types: ["modifierExtra"], id: "ancestor" },
  interiorOnly: { types: ["simpleModifier"], id: "interiorOnly" },
  excludeInterior: { types: ["simpleModifier"], id: "excludeInterior" },
  leading: { types: ["simpleModifier"], id: "leading" },
  trailing: { types: ["simpleModifier"], id: "trailing" },
  extendThroughStartOf: {
    types: ["simpleModifier"],
    id: "extendThroughStartOf",
  },
  extendThroughEndOf: {
    types: ["simpleModifier"],
    id: "extendThroughEndOf",
  },
  startOf: { types: ["simpleModifier"], id: "startOf" },
  endOf: { types: ["simpleModifier"], id: "endOf" },
  visible: { types: ["simpleModifier"], id: "visible" },
  keepContentFilter: {
    types: ["simpleModifier"],
    id: "keepContentFilter",
  },
  keepEmptyFilter: {
    types: ["simpleModifier"],
    id: "keepEmptyFilter",
  },
  toRawSelection: { types: ["simpleModifier"], id: "toRawSelection" },
  inferPreviousMark: {
    types: ["simpleModifier"],
    id: "inferPreviousMark",
  },
};

type SyntaxReplacement = readonly [string, readonly string[]];

const syntaxReplacementDefinitions = {
  swapConnective: {
    type: "connective",
    syntaxTerm: connectiveDefaultSpokenForms.swapConnective,
  },
  first: {
    type: "modifierExtra",
    syntaxTerm: modifierExtraReferences.first.defaultSpokenForm,
  },
  last: {
    type: "modifierExtra",
    syntaxTerm: modifierExtraReferences.last.defaultSpokenForm,
  },
  previous: {
    type: "modifierExtra",
    syntaxTerm: modifierExtraReferences.previous.defaultSpokenForm,
  },
  next: {
    type: "modifierExtra",
    syntaxTerm: modifierExtraReferences.next.defaultSpokenForm,
  },
  forward: {
    type: "modifierExtra",
    syntaxTerm: modifierExtraReferences.forward.defaultSpokenForm,
  },
  backward: {
    type: "modifierExtra",
    syntaxTerm: modifierExtraReferences.backward.defaultSpokenForm,
  },
  everyScope: {
    type: "simpleModifier",
    syntaxTerm: modifierReferences.everyScope.defaultSpokenForm,
  },
  token: {
    type: "simpleScopeTypeType",
    syntaxTerm: scopeReferences.token.defaultSpokenForm,
  },
  at: {
    type: "connective",
    syntaxTerm: connectiveDefaultSpokenForms.at,
  },
  on: {
    type: "connective",
    syntaxTerm: connectiveDefaultSpokenForms.on,
  },
} as const;

type SyntaxReplacementId = keyof typeof syntaxReplacementDefinitions;

function getSyntaxReplacements(
  resolver: SpokenFormResolver,
): readonly SyntaxReplacement[] {
  return [
    replacement(resolver, "swapConnective"),
    replacement(resolver, "first"),
    replacement(resolver, "last"),
    replacement(resolver, "previous"),
    replacement(resolver, "next"),
    replacement(resolver, "forward"),
    replacement(resolver, "backward"),
    replacement(resolver, "everyScope"),
    replacement(resolver, "token"),
    replacement(resolver, "at"),
    replacement(resolver, "on"),
  ];
}

function replacement(
  resolver: SpokenFormResolver,
  id: SyntaxReplacementId,
): SyntaxReplacement {
  const { type, syntaxTerm } = syntaxReplacementDefinitions[id];
  return [syntaxTerm, resolver.get([type], id)];
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
      .map(([id, reference]) => ({
        id,
        type: "pairedDelimiter",
        variations: resolver.get(["pairedDelimiter"], id).map((spokenForm) => ({
          spokenForm,
          description: capitalize(reference.name),
        })),
      }))
      .filter(({ variations }) => variations.length > 0),
  };
}

function makeReadable(value: string): string {
  return capitalize(camelCaseToAllDown(value.replaceAll(".", " ")));
}

function colorsSection(resolver: SpokenFormResolver): CheatsheetSection {
  return {
    name: "Colors",
    id: "colors",
    items: Object.entries(hatColorDefaultSpokenForms)
      .filter(([id, spokenForm]) => id !== "default" && spokenForm != null)
      .map(([id]) => ({
        id,
        type: "hatColor",
        variations: resolver.get(["hatColor"], id).map((spokenForm) => ({
          spokenForm,
          description: capitalize(id),
        })),
      }))
      .filter(({ variations }) => variations.length > 0),
  };
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
        types: ["connective"],
        descriptions: ["<target 1> and <target 2>"],
      },
      {
        id: "rangeExclusive",
        types: ["connective"],
        descriptions: [
          "between <target 1> and <target 2>",
          "between selection and <target>",
        ],
      },
      {
        id: "rangeInclusive",
        types: ["connective"],
        descriptions: [
          "<target 1> through <target 2>",
          "selection through <target>",
        ],
      },
      {
        id: "rangeExcludingStart",
        types: ["connective"],
        descriptions: [
          "end of <target 1> through <target 2>",
          "end of selection through <target>",
        ],
      },
      {
        id: "rangeExcludingEnd",
        types: ["connective"],
        descriptions: [
          "<target 1> until start of <target 2>",
          "selection until start of <target>",
        ],
      },
      {
        id: "verticalRange",
        types: ["connective"],
        descriptions: [
          "<target 1> vertically through <target 2>",
          "selection vertically through <target>",
        ],
      },
    ]
      .map(({ id, types, descriptions }) => {
        return {
          id,
          type: "compoundTargetConnective",
          variations: resolver.get(types, id).flatMap((customSpokenForm) =>
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
        valueId: "after",
        description: "Insert after <target>",
      },
      {
        id: "destination_before",
        valueId: "before",
        description: "Insert before <target>",
      },
      {
        id: "destination_to",
        valueId: "to",
        description: "Replace <target>",
      },
    ]
      .map(({ id, valueId, description }) => ({
        id,
        type: "destination",
        variations: resolver
          .get(["insertionMode"], valueId)
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
    ["scopeVisualizer"],
    "showScopeVisualizer",
  );
  return {
    name: "Scope visualizer",
    id: "scopeVisualizer",
    items: [
      items(
        "hideScopeVisualizer",
        "command",
        resolver.get(["scopeVisualizer"], "hideScopeVisualizer"),
        "Hide scope visualizer",
      ),
      items(
        "show_scope_sidebar",
        "command",
        resolver
          .get(["sidebar"], "bar")
          .map((spokenForm) => `${spokenForm} cursorless`),
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
              .get(["scopeVisualizer"], visualizationType)
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
        variations: resolver.get(["hatShape"], id).map((spokenForm) => ({
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
        resolver.get(["specialMark"], "currentSelection"),
        "Current selection",
      ),
      items(
        "lineNumberModulo100",
        "mark",
        resolver
          .get(["specialMark"], "lineNumberModulo100")
          .map((spokenForm) => `${spokenForm} <number>`),
        "Line number modulo 100",
      ),
      items(
        "lineNumberRelativeDown",
        "mark",
        resolver
          .get(["specialMark"], "lineNumberRelativeDown")
          .map((spokenForm) => `${spokenForm} <number>`),
        "Line number down from cursor",
      ),
      items(
        "lineNumberRelativeUp",
        "mark",
        resolver
          .get(["specialMark"], "lineNumberRelativeUp")
          .map((spokenForm) => `${spokenForm} <number>`),
        "Line number up from cursor",
      ),
      items(
        "nothing",
        "mark",
        resolver.get(["specialMark"], "nothing"),
        "Nothing",
      ),
      items(
        "previousSource",
        "mark",
        resolver.get(["specialMark"], "previousSource"),
        "Previous source",
      ),
      items(
        "previousTarget",
        "mark",
        resolver.get(["specialMark"], "previousTarget"),
        "Previous target",
      ),
      items(
        "unknownSymbol",
        "mark",
        resolver.get(["specialMark"], "unknownSymbol"),
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
