import type { ModifierType } from "../types/command/PartialTargetDescriptor.types";
import type { ReferenceEntry } from "./ReferenceEntry";

const DEFAULT_PATTERN = "<spokenForm>";

type AdditionalModifierReferenceType = "ancestor";

export const modifierReferences: Record<
  ModifierType | AdditionalModifierReferenceType,
  ReferenceEntry
> = {
  startOf: {
    name: "Start of",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Empty position at start of target",
        cheatsheet: "Empty position at start of target",
      },
    ],
    examples: [],
  },
  endOf: {
    name: "End of",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Empty position at end of target",
        cheatsheet: "Empty position at end of target",
      },
    ],
    examples: [],
  },
  interiorOnly: {
    name: "Interior only",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Interior only",
        cheatsheet: "Interior only",
      },
    ],
    examples: [],
  },
  excludeInterior: {
    name: "Exclude interior",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Bounding paired delimiters",
        cheatsheet: "Bounding paired delimiters",
      },
    ],
    examples: [],
  },
  visible: {
    name: "Visible",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Visible in viewport",
        cheatsheet: "Visible in viewport",
      },
    ],
    examples: [],
  },
  containingScope: {
    name: "Containing scope",
    syntaxes: [
      {
        pattern: "<scope>",
        description: "Containing instance of <scope>",
        cheatsheet: "Containing instance of <scope>",
      },
    ],
    examples: [],
  },
  everyScope: {
    name: "Every scope",
    syntaxes: [
      {
        pattern: "<spokenForm> <scope>",
        description: "Every instance of <scope>",
        cheatsheet: "Every instance of <scope>",
      },
    ],
    examples: [],
  },
  ancestor: {
    name: "Ancestor",
    syntaxes: [
      {
        pattern: "<spokenForm> <scope>",
        description: "Grandparent containing instance of <scope>",
        cheatsheet: "Grandparent containing instance of <scope>",
      },
    ],
    examples: [],
  },
  ordinalScope: {
    name: "Ordinal scope",
    syntaxes: [
      {
        pattern: "<ordinal> <scope>",
        description: "<ordinal> instance of <scope> in iteration scope",
        cheatsheet: "<ordinal> instance of <scope> in iteration scope",
      },
      {
        pattern: "<ordinal> <last> <scope>",
        description: "<ordinal>-to-last instance of <scope> in iteration scope",
        cheatsheet: "<ordinal>-to-last instance of <scope> in iteration scope",
      },
      {
        pattern: "<first> <number> <scope>s",
        description:
          "First <number> instances of <scope> in iteration scope, as contiguous range",
        cheatsheet:
          "First <number> instances of <scope> in iteration scope, as contiguous range",
      },
      {
        pattern: "<every> <first> <number> <scope>s",
        description:
          "First <number> instances of <scope> in iteration scope, as individual targets",
        cheatsheet:
          "First <number> instances of <scope> in iteration scope, as individual targets",
      },
      {
        pattern: "<last> <number> <scope>s",
        description:
          "Last <number> instances of <scope> in iteration scope, as contiguous range",
        cheatsheet:
          "Last <number> instances of <scope> in iteration scope, as contiguous range",
      },
      {
        pattern: "<every> <last> <number> <scope>s",
        description:
          "Last <number> instances of <scope> in iteration scope, as individual targets",
        cheatsheet:
          "Last <number> instances of <scope> in iteration scope, as individual targets",
      },
    ],
    examples: [],
  },
  relativeScope: {
    name: "Relative scope",
    syntaxes: [
      {
        pattern: "<previous> <scope>",
        description: "Previous instance of <scope>",
        cheatsheet: "Previous instance of <scope>",
      },
      {
        pattern: "<ordinal> <previous> <scope>",
        description: "<ordinal> instance of <scope> before target",
        cheatsheet: "<ordinal> instance of <scope> before target",
      },
      {
        pattern: "<next> <scope>",
        description: "Next instance of <scope>",
        cheatsheet: "Next instance of <scope>",
      },
      {
        pattern: "<ordinal> <next> <scope>",
        description: "<ordinal> instance of <scope> after target",
        cheatsheet: "<ordinal> instance of <scope> after target",
      },
      {
        pattern: "<scope> <backward>",
        description:
          "Single instance of <scope> including target, going backwards",
        cheatsheet:
          "Single instance of <scope> including target, going backwards",
      },
      {
        pattern: "<scope> <forward>",
        description:
          "Single instance of <scope> including target, going forwards",
        cheatsheet:
          "Single instance of <scope> including target, going forwards",
      },
      {
        pattern: "<number> <scope>s <backward>",
        description:
          "<number> instances of <scope> including target, going backwards, as contiguous range",
        cheatsheet:
          "<number> instances of <scope> including target, going backwards, as contiguous range",
      },
      {
        pattern: "<every> <number> <scope>s <backward>",
        description:
          "<number> instances of <scope> including target, going backwards, as individual targets",
        cheatsheet:
          "<number> instances of <scope> including target, going backwards, as individual targets",
      },
      {
        pattern: "<number> <scope>s",
        description:
          "<number> instances of <scope> including target, going forwards, as contiguous range",
        cheatsheet:
          "<number> instances of <scope> including target, going forwards, as contiguous range",
      },
      {
        pattern: "<every> <number> <scope>s",
        description:
          "<number> instances of <scope> including target, going forwards, as individual targets",
        cheatsheet:
          "<number> instances of <scope> including target, going forwards, as individual targets",
      },
      {
        pattern: "<previous> <number> <scope>s",
        description:
          "Previous <number> instances of <scope>, as contiguous range",
        cheatsheet:
          "Previous <number> instances of <scope>, as contiguous range",
      },
      {
        pattern: "<every> <previous> <number> <scope>s",
        description:
          "Previous <number> instances of <scope>, as individual targets",
        cheatsheet:
          "Previous <number> instances of <scope>, as individual targets",
      },
      {
        pattern: "<next> <number> <scope>s",
        description: "Next <number> instances of <scope>, as contiguous range",
        cheatsheet: "Next <number> instances of <scope>, as contiguous range",
      },
      {
        pattern: "<every> <next> <number> <scope>s",
        description:
          "Next <number> instances of <scope>, as individual targets",
        cheatsheet: "Next <number> instances of <scope>, as individual targets",
      },
    ],
    examples: [],
  },
  extendThroughStartOf: {
    name: "Extend through start of",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Extend through start of line/pair",
        cheatsheet: "Extend through start of line/pair",
      },
      {
        pattern: "<spokenForm> <modifier>",
        description: "Extend through start of <modifier>",
        cheatsheet: "Extend through start of <modifier>",
      },
    ],
    examples: [],
  },
  extendThroughEndOf: {
    name: "Extend through end of",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Extend through end of line/pair",
        cheatsheet: "Extend through end of line/pair",
      },
      {
        pattern: "<spokenForm> <modifier>",
        description: "Extend through end of <modifier>",
        cheatsheet: "Extend through end of <modifier>",
      },
    ],
    examples: [],
  },
  leading: {
    name: "Leading",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Leading delimiter range",
        cheatsheet: "Leading delimiter range",
      },
    ],
    examples: [],
  },
  trailing: {
    name: "Trailing",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Trailing delimiter range",
        cheatsheet: "Trailing delimiter range",
      },
    ],
    examples: [],
  },
  toRawSelection: {
    name: "Raw selection",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "No inference",
        cheatsheet: "No inference",
      },
    ],
    examples: [],
  },
  keepContentFilter: {
    name: "Keep content filter",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Keep content filter",
        cheatsheet: "Keep content filter",
      },
    ],
    examples: [],
  },
  keepEmptyFilter: {
    name: "Keep empty filter",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Keep empty filter",
        cheatsheet: "Keep empty filter",
      },
    ],
    examples: [],
  },
  inferPreviousMark: {
    name: "Infer previous mark",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Infer previous mark",
        cheatsheet: "Infer previous mark",
      },
    ],
    examples: [],
  },

  // Private modifiers, but that has spoken forms
  preferredScope: {
    name: "Preferred scope",
    private: true,
    syntaxes: [],
    examples: [],
  },

  // Modifiers without spoken forms
  modifyIfUntyped: {
    name: "Modify if untyped",
    private: true,
    syntaxes: [
      {
        pattern: "<scope>",
        description: "Preferred instance of <scope>",
        cheatsheet: "Preferred instance of <scope>",
      },
    ],
    examples: [],
  },
  fallback: {
    name: "Fallback",
    private: true,
    syntaxes: [],
    examples: [],
  },
  range: {
    name: "Range",
    private: true,
    syntaxes: [],
    examples: [],
  },
};
