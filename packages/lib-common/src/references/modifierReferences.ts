import type { ModifierType } from "../types/command/PartialTargetDescriptor.types";
import {
  EVERY,
  ITEM,
  LINE,
  REMOVE,
  SET_SELECTION,
  STATEMENT,
  TARGET,
  TARGET_DESC,
  VAR_MODIFIER,
  VAR_NUMBER,
  VAR_ORDINAL,
  VAR_SCOPE,
  VAR_SPOKEN_FORM,
} from "./constants";
import { pairedDelimiterReferences } from "./pairedDelimiterReferences";
import type { ReferenceEntry } from "./ReferenceEntry";
import { connectiveDefaultSpokenForms } from "./spokenForms/connectiveDefaultSpokenForms";
import { graphemeDefaultSpokenForms } from "./spokenForms/graphemeDefaultSpokenForms";
import { ordinalDefaultSpokenForms } from "./spokenForms/numberDefaultSpokenForms";

const DEFAULT_PATTERN = VAR_SPOKEN_FORM;
const PARENTHESES = pairedDelimiterReferences.parentheses.defaultSpokenForm;
const THREE = graphemeDefaultSpokenForms["3"];
const EXTEND_THROUGH_END_OF = "past end of";
const THIRD = ordinalDefaultSpokenForms[3];
const PREVIOUS = connectiveDefaultSpokenForms.previous;
const NEXT = connectiveDefaultSpokenForms.next;
const BACKWARD = connectiveDefaultSpokenForms.backward;
const FORWARD = connectiveDefaultSpokenForms.forward;
const FIRST = connectiveDefaultSpokenForms.first;
const LAST = connectiveDefaultSpokenForms.last;

type AdditionalModifierReferenceType = "ancestor";

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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Places the cursor at the start of the ${TARGET_DESC}.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Places the cursor at the end of the ${TARGET_DESC}.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${PARENTHESES} ${TARGET}`,
        description: `Selects the contents of the parentheses containing the ${TARGET_DESC}, excluding the parentheses.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${PARENTHESES} ${TARGET}`,
        description: `Selects only the parentheses containing the ${TARGET_DESC}.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM}`,
        description:
          "Selects the content currently visible in the editor viewport.",
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${STATEMENT} ${TARGET}`,
        description: `Selects the statement containing the ${TARGET_DESC}.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${ITEM} ${TARGET}`,
        description: `Selects every item in the map containing the ${TARGET_DESC}.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${STATEMENT} ${TARGET}`,
        description: `Selects the parent statement of the statement containing the ${TARGET_DESC}.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${THIRD} ${STATEMENT}`,
        description: "Selects the third statement in the iteration scope.",
      },
      {
        command: `${SET_SELECTION} ${FIRST} ${THREE} ${STATEMENT}s`,
        description:
          "Selects a contiguous range containing the first three statements in the iteration scope.",
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${NEXT} ${STATEMENT} ${TARGET}`,
        description: `Selects the next statement after the statement containing the ${TARGET_DESC}.`,
      },
      {
        command: `${SET_SELECTION} ${THREE} ${STATEMENT}s ${BACKWARD} ${TARGET}`,
        description: `Selects three statements as a contiguous range, starting at the ${TARGET_DESC} and going backward.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects from the ${TARGET_DESC} through the start of its line or surrounding pair.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects from the ${TARGET_DESC} through the end of its line or surrounding pair.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${ITEM} ${TARGET}`,
        description: `Selects the leading delimiter of the item containing the ${TARGET_DESC}.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${ITEM} ${TARGET}`,
        description: `Selects the trailing delimiter of the item containing the ${TARGET_DESC}.`,
      },
    ],
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
    examples: [
      {
        command: `${REMOVE} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Deletes only the ${TARGET_DESC}, leaving adjacent whitespace unchanged.`,
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM}`,
        description:
          "Selects only to the nonempty selections when there are multiple selections.",
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM}`,
        description:
          "Selects only the empty selections when there are multiple selections.",
      },
    ],
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
    examples: [
      {
        command: `${SET_SELECTION} ${TARGET} ${EXTEND_THROUGH_END_OF} ${VAR_SPOKEN_FORM} ${LINE}`,
        description: `Selects from the ${TARGET_DESC} through the end of the line containing that token.`,
      },
    ],
  },

  // Private modifiers, but that has spoken forms
  preferredScope: {
    name: "Preferred scope",
    private: true,
    syntaxes: [
      {
        pattern: VAR_SCOPE,
        description: `Preferred instance of ${VAR_SCOPE}.`,
        cheatsheet: `Preferred instance of ${VAR_SCOPE}`,
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${ITEM} ${TARGET}`,
        description: `Selects the closest item to the ${TARGET_DESC}.`,
      },
    ],
  },

  // Modifiers without spoken forms
  modifyIfUntyped: {
    name: "Modify if untyped",
    private: true,
    syntaxes: [],
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
