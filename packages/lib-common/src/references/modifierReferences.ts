import type { ModifierType } from "../types/command/PartialTargetDescriptor.types";
import type { SpokenFormMapKeyTypes } from "../types/SpokenFormType";
import type { ReferenceEntry, SpokenFormReference } from "./ReferenceEntry";
import {
  VAR_MODIFIER,
  VAR_NUMBER,
  VAR_ORDINAL,
  VAR_SCOPE,
  VAR_SPOKEN_FORM,
} from "./variables";

const DEFAULT_PATTERN = VAR_SPOKEN_FORM;

type AdditionalModifierReferenceType = "ancestor";

const NEXT = "next";
const FIRST = "first";
const LAST = "last";
const PREVIOUS = "previous";
const BACKWARD = "backward";
const FORWARD = "forward";
const EVERY = "every";

export const modifierReferences: Record<
  ModifierType | AdditionalModifierReferenceType,
  ReferenceEntry
> = {
  startOf: {
    name: "Start of",
    defaultSpokenForm: "start of",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Empty position at start of target.",
        cheatsheet: "Empty position at start of target",
      },
    ],
    examples: [],
  },
  endOf: {
    name: "End of",
    defaultSpokenForm: "end of",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Empty position at end of target.",
        cheatsheet: "Empty position at end of target",
      },
    ],
    examples: [],
  },
  interiorOnly: {
    name: "Interior only",
    defaultSpokenForm: "inside",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Interior only.",
        cheatsheet: "Interior only",
      },
    ],
    examples: [],
  },
  excludeInterior: {
    name: "Exclude interior",
    defaultSpokenForm: "bounds",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Bounding paired delimiters.",
        cheatsheet: "Bounding paired delimiters",
      },
    ],
    examples: [],
  },
  visible: {
    name: "Visible",
    defaultSpokenForm: "visible",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Visible in viewport.",
        cheatsheet: "Visible in viewport",
      },
    ],
    examples: [],
  },
  containingScope: {
    name: "Containing scope",
    syntaxes: [
      {
        pattern: VAR_SCOPE,
        description: `Containing instance of ${VAR_SCOPE}.`,
        cheatsheet: `Containing instance of ${VAR_SCOPE}`,
      },
    ],
    examples: [],
  },
  everyScope: {
    name: "Every scope",
    defaultSpokenForm: EVERY,
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_SCOPE}`,
        description: `Every instance of ${VAR_SCOPE}.`,
        cheatsheet: `Every instance of ${VAR_SCOPE}`,
      },
    ],
    examples: [],
  },
  ancestor: {
    name: "Ancestor",
    defaultSpokenForm: "grand",
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_SCOPE}`,
        description: `Grandparent containing instance of ${VAR_SCOPE}.`,
        cheatsheet: `Grandparent containing instance of ${VAR_SCOPE}`,
      },
    ],
    examples: [],
  },
  ordinalScope: {
    name: "Ordinal scope",
    syntaxes: [
      {
        pattern: `${VAR_ORDINAL} ${VAR_SCOPE}`,
        description: `${VAR_ORDINAL} instance of ${VAR_SCOPE} in iteration scope.`,
        cheatsheet: `${VAR_ORDINAL} instance of ${VAR_SCOPE} in iteration scope`,
      },
      {
        pattern: `${VAR_ORDINAL} ${LAST} ${VAR_SCOPE}`,
        description: `${VAR_ORDINAL}-to-last instance of ${VAR_SCOPE} in iteration scope.`,
        cheatsheet: `${VAR_ORDINAL}-to-last instance of ${VAR_SCOPE} in iteration scope`,
      },
      {
        pattern: `${FIRST} ${VAR_NUMBER} ${VAR_SCOPE}s`,
        description: `First ${VAR_NUMBER} instances of ${VAR_SCOPE} in iteration scope, as contiguous range.`,
        cheatsheet: `First ${VAR_NUMBER} instances of ${VAR_SCOPE} in iteration scope, as contiguous range`,
      },
      {
        pattern: `${EVERY} ${FIRST} ${VAR_NUMBER} ${VAR_SCOPE}s`,
        description: `First ${VAR_NUMBER} instances of ${VAR_SCOPE} in iteration scope, as individual targets.`,
        cheatsheet: `First ${VAR_NUMBER} instances of ${VAR_SCOPE} in iteration scope, as individual targets`,
      },
      {
        pattern: `${LAST} ${VAR_NUMBER} ${VAR_SCOPE}s`,
        description: `Last ${VAR_NUMBER} instances of ${VAR_SCOPE} in iteration scope, as contiguous range.`,
        cheatsheet: `Last ${VAR_NUMBER} instances of ${VAR_SCOPE} in iteration scope, as contiguous range`,
      },
      {
        pattern: `${EVERY} ${LAST} ${VAR_NUMBER} ${VAR_SCOPE}s`,
        description: `Last ${VAR_NUMBER} instances of ${VAR_SCOPE} in iteration scope, as individual targets.`,
        cheatsheet: `Last ${VAR_NUMBER} instances of ${VAR_SCOPE} in iteration scope, as individual targets`,
      },
    ],
    examples: [],
  },
  relativeScope: {
    name: "Relative scope",
    syntaxes: [
      {
        pattern: `${PREVIOUS} ${VAR_SCOPE}`,
        description: `Previous instance of ${VAR_SCOPE}.`,
        cheatsheet: `Previous instance of ${VAR_SCOPE}`,
      },
      {
        pattern: `${VAR_ORDINAL} ${PREVIOUS} ${VAR_SCOPE}`,
        description: `${VAR_ORDINAL} instance of ${VAR_SCOPE} before target.`,
        cheatsheet: `${VAR_ORDINAL} instance of ${VAR_SCOPE} before target`,
      },
      {
        pattern: `${NEXT} ${VAR_SCOPE}`,
        description: `Next instance of ${VAR_SCOPE}.`,
        cheatsheet: `Next instance of ${VAR_SCOPE}`,
      },
      {
        pattern: `${VAR_ORDINAL} ${NEXT} ${VAR_SCOPE}`,
        description: `${VAR_ORDINAL} instance of ${VAR_SCOPE} after target.`,
        cheatsheet: `${VAR_ORDINAL} instance of ${VAR_SCOPE} after target`,
      },
      {
        pattern: `${VAR_SCOPE} ${BACKWARD}`,
        description: `Single instance of ${VAR_SCOPE} including target, going backwards.`,
        cheatsheet: `Single instance of ${VAR_SCOPE} including target, going backwards`,
      },
      {
        pattern: `${VAR_SCOPE} ${FORWARD}`,
        description: `Single instance of ${VAR_SCOPE} including target, going forwards.`,
        cheatsheet: `Single instance of ${VAR_SCOPE} including target, going forwards`,
      },
      {
        pattern: `${VAR_NUMBER} ${VAR_SCOPE}s ${BACKWARD}`,
        description: `${VAR_NUMBER} instances of ${VAR_SCOPE} including target, going backwards, as contiguous range.`,
        cheatsheet: `${VAR_NUMBER} instances of ${VAR_SCOPE} including target, going backwards, as contiguous range`,
      },
      {
        pattern: `${EVERY} ${VAR_NUMBER} ${VAR_SCOPE}s ${BACKWARD}`,
        description: `${VAR_NUMBER} instances of ${VAR_SCOPE} including target, going backwards, as individual targets.`,
        cheatsheet: `${VAR_NUMBER} instances of ${VAR_SCOPE} including target, going backwards, as individual targets`,
      },
      {
        pattern: `${VAR_NUMBER} ${VAR_SCOPE}s`,
        description: `${VAR_NUMBER} instances of ${VAR_SCOPE} including target, going forwards, as contiguous range.`,
        cheatsheet: `${VAR_NUMBER} instances of ${VAR_SCOPE} including target, going forwards, as contiguous range`,
      },
      {
        pattern: `${EVERY} ${VAR_NUMBER} ${VAR_SCOPE}s`,
        description: `${VAR_NUMBER} instances of ${VAR_SCOPE} including target, going forwards, as individual targets.`,
        cheatsheet: `${VAR_NUMBER} instances of ${VAR_SCOPE} including target, going forwards, as individual targets`,
      },
      {
        pattern: `${PREVIOUS} ${VAR_NUMBER} ${VAR_SCOPE}s`,
        description: `Previous ${VAR_NUMBER} instances of ${VAR_SCOPE}, as contiguous range.`,
        cheatsheet: `Previous ${VAR_NUMBER} instances of ${VAR_SCOPE}, as contiguous range`,
      },
      {
        pattern: `${EVERY} ${PREVIOUS} ${VAR_NUMBER} ${VAR_SCOPE}s`,
        description: `Previous ${VAR_NUMBER} instances of ${VAR_SCOPE}, as individual targets.`,
        cheatsheet: `Previous ${VAR_NUMBER} instances of ${VAR_SCOPE}, as individual targets`,
      },
      {
        pattern: `${NEXT} ${VAR_NUMBER} ${VAR_SCOPE}s`,
        description: `Next ${VAR_NUMBER} instances of ${VAR_SCOPE}, as contiguous range.`,
        cheatsheet: `Next ${VAR_NUMBER} instances of ${VAR_SCOPE}, as contiguous range`,
      },
      {
        pattern: `${EVERY} ${NEXT} ${VAR_NUMBER} ${VAR_SCOPE}s`,
        description: `Next ${VAR_NUMBER} instances of ${VAR_SCOPE}, as individual targets.`,
        cheatsheet: `Next ${VAR_NUMBER} instances of ${VAR_SCOPE}, as individual targets`,
      },
    ],
    examples: [],
  },
  extendThroughStartOf: {
    name: "Extend through start of",
    defaultSpokenForm: "head",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Extend through start of line/pair.",
        cheatsheet: "Extend through start of line/pair",
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_MODIFIER}`,
        description: `Extend through start of ${VAR_MODIFIER}.`,
        cheatsheet: `Extend through start of ${VAR_MODIFIER}`,
      },
    ],
    examples: [],
  },
  extendThroughEndOf: {
    name: "Extend through end of",
    defaultSpokenForm: "tail",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Extend through end of line/pair.",
        cheatsheet: "Extend through end of line/pair",
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_MODIFIER}`,
        description: `Extend through end of ${VAR_MODIFIER}.`,
        cheatsheet: `Extend through end of ${VAR_MODIFIER}`,
      },
    ],
    examples: [],
  },
  leading: {
    name: "Leading",
    defaultSpokenForm: "leading",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Leading delimiter range.",
        cheatsheet: "Leading delimiter range",
      },
    ],
    examples: [],
  },
  trailing: {
    name: "Trailing",
    defaultSpokenForm: "trailing",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Trailing delimiter range.",
        cheatsheet: "Trailing delimiter range",
      },
    ],
    examples: [],
  },
  toRawSelection: {
    name: "Raw selection",
    defaultSpokenForm: "just",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "No inference.",
        cheatsheet: "No inference",
      },
    ],
    examples: [],
  },
  keepContentFilter: {
    name: "Keep content filter",
    defaultSpokenForm: "content",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Keep content filter.",
        cheatsheet: "Keep content filter",
      },
    ],
    examples: [],
  },
  keepEmptyFilter: {
    name: "Keep empty filter",
    defaultSpokenForm: "empty",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Keep empty filter.",
        cheatsheet: "Keep empty filter",
      },
    ],
    examples: [],
  },
  inferPreviousMark: {
    name: "Infer previous mark",
    defaultSpokenForm: "its",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Infer previous mark.",
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
        pattern: VAR_SCOPE,
        description: `Preferred instance of ${VAR_SCOPE}.`,
        cheatsheet: `Preferred instance of ${VAR_SCOPE}`,
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

export const simpleModifierReferenceIds = [
  "excludeInterior",
  "toRawSelection",
  "leading",
  "trailing",
  "keepContentFilter",
  "keepEmptyFilter",
  "inferPreviousMark",
  "startOf",
  "endOf",
  "interiorOnly",
  "visible",
  "extendThroughStartOf",
  "extendThroughEndOf",
  "everyScope",
] as const satisfies readonly SpokenFormMapKeyTypes["simpleModifier"][];

export const modifierExtraReferenceIds = [
  "first",
  "last",
  "previous",
  "next",
  "forward",
  "backward",
  "ancestor",
] as const satisfies readonly SpokenFormMapKeyTypes["modifierExtra"][];

export const modifierExtraReferences = {
  first: {
    defaultSpokenForm: FIRST,
  },
  last: {
    defaultSpokenForm: LAST,
  },
  previous: {
    defaultSpokenForm: PREVIOUS,
  },
  next: {
    defaultSpokenForm: NEXT,
  },
  forward: {
    defaultSpokenForm: FORWARD,
  },
  backward: {
    defaultSpokenForm: BACKWARD,
  },
  ancestor: modifierReferences.ancestor,
} satisfies Record<SpokenFormMapKeyTypes["modifierExtra"], SpokenFormReference>;
