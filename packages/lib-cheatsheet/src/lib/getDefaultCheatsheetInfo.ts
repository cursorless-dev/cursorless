import {
  actionReferences,
  connectiveDefaultSpokenForms,
  graphemeDefaultSpokenForms,
  hatColorDefaultSpokenForms,
  lineDirectionDefaultSpokenForms,
  markDefaultSpokenForms,
  modifierReferences,
  pairedDelimiterReferences,
  scopeReferences,
} from "@cursorless/lib-common/references";
import type { SpokenFormReference } from "@cursorless/lib-common/references";
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

/** Construct the stock cheatsheet directly from the canonical references. */
export function getDefaultCheatsheetInfo(): CheatsheetInfo {
  return {
    sections: [
      referenceSection("Actions", "actions", "action", actionReferences),
      colorsSection,
      compoundTargetsSection,
      destinationsSection,
      referenceSection(
        "Modifiers",
        "modifiers",
        "modifier",
        modifierReferences,
        {
          endOf: "end",
          everyScope: "every",
          startOf: "start",
        },
      ),
      pairedDelimitersSection(),
      scopeVisualizerSection,
      referenceSection("Scopes", "scopes", "scopeType", scopeReferences, {
        surroundingPair: "pair",
      }),
      shapesSection,
      specialMarksSection,
      tutorialSection,
    ],
  };
}

function referenceSection(
  name: string,
  id: string,
  type: string,
  references: ReferenceMap,
  itemIdOverrides: Readonly<Record<string, string>> = {},
): CheatsheetSection {
  return {
    name,
    id,
    items: Object.entries(references)
      .filter(([, reference]) => isEnabledPublicReference(reference))
      .map(([referenceId, reference]) => ({
        id: itemIdOverrides[referenceId] ?? referenceId,
        type,
        variations: reference.syntaxes.map(({ pattern, cheatsheet }) => ({
          spokenForm: pattern.replaceAll(
            REFERENCE_SPOKEN_FORM,
            reference.defaultSpokenForm ?? REFERENCE_SPOKEN_FORM,
          ),
          description: cheatsheet,
        })),
      }))
      .filter(({ variations }) => variations.length > 0),
  };
}

function isEnabledPublicReference(reference: CheatsheetReference): boolean {
  return !reference.private && !reference.disabledByDefault;
}

function pairedDelimitersSection(): CheatsheetSection {
  return {
    name: "Paired delimiters",
    id: "pairedDelimiters",
    items: Object.entries(pairedDelimiterReferences)
      .filter(([, reference]) => isEnabledSpokenFormReference(reference))
      .map(([id, reference]) => ({
        id,
        type: "pairedDelimiter",
        variations: [
          {
            spokenForm: reference.defaultSpokenForm,
            description: capitalize(reference.name),
          },
        ],
      })),
  };
}

function isEnabledSpokenFormReference(reference: SpokenFormReference): boolean {
  return !reference.private && !reference.disabledByDefault;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const colorsSection: CheatsheetSection = {
  name: "Colors",
  id: "colors",
  items: [
    ["blue", requiredSpokenForm(hatColorDefaultSpokenForms.blue)],
    ["green", requiredSpokenForm(hatColorDefaultSpokenForms.green)],
    ["pink", requiredSpokenForm(hatColorDefaultSpokenForms.pink)],
    ["red", requiredSpokenForm(hatColorDefaultSpokenForms.red)],
    ["yellow", requiredSpokenForm(hatColorDefaultSpokenForms.yellow)],
  ].map(([id, spokenForm]) => ({
    id,
    type: "hatColor",
    variations: [{ spokenForm, description: capitalize(id) }],
  })),
};

function requiredSpokenForm(spokenForm: string | null): string {
  if (spokenForm == null) {
    throw new Error("Expected a default spoken form");
  }

  return spokenForm;
}

const compoundTargetsSection: CheatsheetSection = {
  name: "Compound targets",
  id: "compoundTargets",
  items: [
    {
      id: "listConnective",
      spokenForm: connectiveDefaultSpokenForms.listConnective,
      descriptions: ["<target 1> and <target 2>"],
    },
    {
      id: "rangeExclusive",
      spokenForm: connectiveDefaultSpokenForms.rangeExclusive,
      descriptions: [
        "between <target 1> and <target 2>",
        "between selection and <target>",
      ],
    },
    {
      id: "rangeInclusive",
      spokenForm: connectiveDefaultSpokenForms.rangeInclusive,
      descriptions: [
        "<target 1> through <target 2>",
        "selection through <target>",
      ],
    },
    {
      id: "rangeExcludingEnd",
      spokenForm: connectiveDefaultSpokenForms.rangeExcludingEnd,
      descriptions: [
        "<target 1> until start of <target 2>",
        "selection until start of <target>",
      ],
    },
    {
      id: "verticalRange",
      spokenForm: connectiveDefaultSpokenForms.verticalRange,
      descriptions: [
        "<target 1> vertically through <target 2>",
        "selection vertically through <target>",
      ],
    },
  ].map(({ id, spokenForm, descriptions }) => ({
    id,
    type: "compoundTargetConnective",
    variations: descriptions.map((description, index) => ({
      spokenForm:
        index === 0
          ? `<target 1> ${spokenForm} <target 2>`
          : `${spokenForm} <target>`,
      description,
    })),
  })),
};

const destinationsSection: CheatsheetSection = {
  name: "Destinations",
  id: "destinations",
  items: [
    {
      id: "destination_after",
      spokenForm: connectiveDefaultSpokenForms.after,
      description: "Insert after <target>",
    },
    {
      id: "destination_before",
      spokenForm: connectiveDefaultSpokenForms.before,
      description: "Insert before <target>",
    },
    {
      id: "destination_to",
      spokenForm: connectiveDefaultSpokenForms.sourceDestinationConnective,
      description: "Replace <target>",
    },
  ].map(({ id, spokenForm, description }) => ({
    id,
    type: "destination",
    variations: [{ spokenForm: `${spokenForm} <target>`, description }],
  })),
};

const scopeVisualizerSection: CheatsheetSection = {
  name: "Scope visualizer",
  id: "scopeVisualizer",
  items: [
    item(
      "hideScopeVisualizer",
      "command",
      "visualize nothing",
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
      variations: [
        { spokenForm: "visualize <scope>", description: "Visualize <scope>" },
        {
          spokenForm: "visualize <scope> removal",
          description: "Visualize <scope> removal range",
        },
        {
          spokenForm: "visualize <scope> iteration",
          description: "Visualize <scope> iteration range",
        },
      ],
    },
  ],
};

const shapesSection: CheatsheetSection = {
  name: "Shapes",
  id: "shapes",
  items: [],
};

const specialMarksSection: CheatsheetSection = {
  name: "Special marks",
  id: "specialMarks",
  items: [
    item(
      "currentSelection",
      "mark",
      markDefaultSpokenForms.cursor,
      "Current selection",
    ),
    item(
      "lineNumberModulo100",
      "mark",
      `${lineDirectionDefaultSpokenForms.modulo100} <number>`,
      "Line number modulo 100",
    ),
    item(
      "lineNumberRelativeDown",
      "mark",
      `${lineDirectionDefaultSpokenForms.relativeDown} <number>`,
      "Line number down from cursor",
    ),
    item(
      "lineNumberRelativeUp",
      "mark",
      `${lineDirectionDefaultSpokenForms.relativeUp} <number>`,
      "Line number up from cursor",
    ),
    item("nothing", "mark", markDefaultSpokenForms.nothing, "Nothing"),
    item(
      "previousSource",
      "mark",
      markDefaultSpokenForms.source,
      "Previous source",
    ),
    item(
      "previousTarget",
      "mark",
      markDefaultSpokenForms.that,
      "Previous target",
    ),
    item(
      "unknownSymbol",
      "mark",
      graphemeDefaultSpokenForms["\uFFFD"],
      "Unknown symbol",
    ),
  ],
};

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
