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
import type { ModifierReferenceGroupId } from "./modifierReferenceGroups";
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
const PASTE = "paste";
const BRING = "bring";
const FROM = "from";
const AFTER = connectiveDefaultSpokenForms.after;
const TO = connectiveDefaultSpokenForms.sourceDestinationConnective;
const INSTANCE = "instance";
const VALUE = "value";

const ITERATION_SCOPE_DESCRIPTION =
  "The iteration scope depends on the scope type. For example, functions iterate within a class, tokens within a line, and characters within a token.";

type AdditionalModifierReferenceType = "ancestor";

export const modifierReferences = {
  // Group: containing
  containingScope: {
    name: "Containing scope",
    group: { id: "containing", index: 0 },
    description:
      'Expands a target to the containing instance of a scope. When the input is `"this"` with multiple selections, Cursorless expands each selection independently.',
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
    group: { id: "containing", index: 1 },
    description:
      "Selects all matching sibling scopes. It can also prefix an ordinal or relative modifier to return separate targets instead of one contiguous range.",
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
    group: { id: "containing", index: 2 },
    description:
      'Selects the parent of a containing scope. Repeat `"grand"` to walk up more than one parent level.',
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_SCOPE}`,
        description: `Parent of the containing instance of ${VAR_SCOPE}.`,
        cheatsheet: `Parent of the containing instance of ${VAR_SCOPE}`,
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${STATEMENT} ${TARGET}`,
        description: `Selects the parent statement of the statement containing the ${TARGET_DESC}.`,
      },
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${VAR_SPOKEN_FORM} ${STATEMENT} ${TARGET}`,
        description: `Selects the grandparent statement of the statement containing the ${TARGET_DESC}.`,
      },
    ],
  },

  // Group: ordinal
  ordinalScope: {
    name: "Ordinal scope",
    group: { id: "ordinal", index: 0 },
    description: `${ITERATION_SCOPE_DESCRIPTION}

Without \`"every"\`, plural ordinal forms produce one contiguous range. Prefix them with \`"every"\` to produce separate targets instead.

<div className="dark-mode-invert">

![Relative and ordinal modifier diagram](../images/relative_ordinal.png)

</div>`,
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
        command: `${SET_SELECTION} ${THIRD} ${LAST} ${STATEMENT}`,
        description:
          "Selects the third-to-last statement in the iteration scope.",
      },
      {
        command: `${SET_SELECTION} ${FIRST} ${THREE} ${STATEMENT}s`,
        description:
          "Selects a contiguous range containing the first three statements in the iteration scope.",
      },
      {
        command: `${SET_SELECTION} ${EVERY} ${FIRST} ${THREE} ${STATEMENT}s`,
        description:
          "Selects the first three statements in the iteration scope as individual targets.",
      },
      {
        command: `${SET_SELECTION} ${LAST} ${THREE} ${STATEMENT}s`,
        description:
          "Selects a contiguous range containing the last three statements in the iteration scope.",
      },
      {
        command: `${SET_SELECTION} ${EVERY} ${LAST} ${THREE} ${STATEMENT}s`,
        description:
          "Selects the last three statements in the iteration scope as individual targets.",
      },
    ],
  },

  // Group: relative
  relativeScope: {
    name: "Relative scope",
    group: { id: "relative", index: 0 },
    description: `${ITERATION_SCOPE_DESCRIPTION}

Relative modifiers select scopes before or after the input target. Without \`"every"\`, plural forms produce one contiguous range; prefix them with \`"every"\` to produce separate targets instead.`,
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
        command: `${SET_SELECTION} ${PREVIOUS} ${STATEMENT} ${TARGET}`,
        description: `Selects the previous statement before the statement containing the ${TARGET_DESC}.`,
      },
      {
        command: `${SET_SELECTION} ${THIRD} ${PREVIOUS} ${STATEMENT} ${TARGET}`,
        description: `Selects the third statement before the statement containing the ${TARGET_DESC}.`,
      },
      {
        command: `${SET_SELECTION} ${NEXT} ${STATEMENT} ${TARGET}`,
        description: `Selects the next statement after the statement containing the ${TARGET_DESC}.`,
      },
      {
        command: `${SET_SELECTION} ${THIRD} ${NEXT} ${STATEMENT} ${TARGET}`,
        description: `Selects the third statement after the statement containing the ${TARGET_DESC}.`,
      },
      {
        command: `${SET_SELECTION} ${STATEMENT} ${BACKWARD} ${TARGET}`,
        description: `Selects the statement containing the ${TARGET_DESC}, searching backward.`,
      },
      {
        command: `${SET_SELECTION} ${STATEMENT} ${FORWARD} ${TARGET}`,
        description: `Selects the statement containing the ${TARGET_DESC}, searching forward.`,
      },
      {
        command: `${SET_SELECTION} ${THREE} ${STATEMENT}s ${BACKWARD} ${TARGET}`,
        description: `Selects three statements, including the statement containing the ${TARGET_DESC}, searching backward, as a contiguous range.`,
      },
      {
        command: `${SET_SELECTION} ${EVERY} ${THREE} ${STATEMENT}s ${BACKWARD} ${TARGET}`,
        description: `Selects three statements, including the statement containing the ${TARGET_DESC}, searching backward, as individual targets.`,
      },
      {
        command: `${SET_SELECTION} ${THREE} ${STATEMENT}s ${TARGET}`,
        description: `Selects three statements, including the statement containing the ${TARGET_DESC}, searching forward, as a contiguous range.`,
      },
      {
        command: `${SET_SELECTION} ${EVERY} ${THREE} ${STATEMENT}s ${TARGET}`,
        description: `Selects three statements, including the statement containing the ${TARGET_DESC}, searching forward, as individual targets.`,
      },
      {
        command: `${SET_SELECTION} ${PREVIOUS} ${THREE} ${STATEMENT}s ${TARGET}`,
        description: `Selects the previous three statements before the statement containing the ${TARGET_DESC} as a contiguous range.`,
      },
      {
        command: `${SET_SELECTION} ${EVERY} ${PREVIOUS} ${THREE} ${STATEMENT}s ${TARGET}`,
        description: `Selects the previous three statements before the statement containing the ${TARGET_DESC} as individual targets.`,
      },
      {
        command: `${SET_SELECTION} ${NEXT} ${THREE} ${STATEMENT}s ${TARGET}`,
        description: `Selects the next three statements after the statement containing the ${TARGET_DESC} as a contiguous range.`,
      },
      {
        command: `${SET_SELECTION} ${EVERY} ${NEXT} ${THREE} ${STATEMENT}s ${TARGET}`,
        description: `Selects the next three statements after the statement containing the ${TARGET_DESC} as individual targets.`,
      },
    ],
  },

  // Group: delimiters
  interiorOnly: {
    name: "Interior only",
    defaultSpokenForm: "inside",
    group: { id: "delimiters", index: 0 },
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
    group: { id: "delimiters", index: 1 },
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
  leading: {
    name: "Leading",
    defaultSpokenForm: "leading",
    group: { id: "delimiters", index: 2 },
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
    group: { id: "delimiters", index: 3 },
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

  // Group: range
  extendThroughStartOf: {
    name: "Extend through start of",
    defaultSpokenForm: "head",
    group: { id: "range", index: 0 },
    description:
      'Extends a target through the start of its line. Inside a surrounding pair, it stops at the start of the pair\'s interior; use an explicit scope such as `"head line"` to override that boundary.',
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
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${STATEMENT} ${TARGET}`,
        description: `Selects from the ${TARGET_DESC} through the start of its containing statement.`,
      },
    ],
  },
  extendThroughEndOf: {
    name: "Extend through end of",
    defaultSpokenForm: "tail",
    group: { id: "range", index: 1 },
    description:
      'Extends a target through the end of its line. Inside a surrounding pair, it stops at the end of the pair\'s interior; use an explicit scope such as `"tail line"` to override that boundary.',
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
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${STATEMENT} ${TARGET}`,
        description: `Selects from the ${TARGET_DESC} through the end of its containing statement.`,
      },
    ],
  },

  // Group: position
  startOf: {
    name: "Start of",
    defaultSpokenForm: "start of",
    group: { id: "position", index: 0 },
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
    group: { id: "position", index: 1 },
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

  // Group: filters
  visible: {
    name: "Visible",
    defaultSpokenForm: "visible",
    group: { id: "filters", index: 0 },
    description:
      'Limits a target to content currently visible in the editor viewport, excluding folded regions and content scrolled off screen. This is especially useful with the `"from"` action when searching for instances.',
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
      {
        command: `${FROM} ${VAR_SPOKEN_FORM} ${SET_SELECTION} ${EVERY} ${INSTANCE} ${TARGET}`,
        description: `Selects the visible instances of the ${TARGET_DESC}, excluding matches that are folded or outside the viewport.`,
      },
    ],
  },
  keepContentFilter: {
    name: "Keep content filter",
    defaultSpokenForm: "content",
    group: { id: "filters", index: 1 },
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
          "Selects only the nonempty selections when there are multiple selections.",
      },
    ],
  },
  keepEmptyFilter: {
    name: "Keep empty filter",
    defaultSpokenForm: "empty",
    group: { id: "filters", index: 2 },
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

  // Group: inference
  toRawSelection: {
    name: "Raw selection",
    defaultSpokenForm: "just",
    group: { id: "inference", index: 0 },
    description:
      'Strips semantic information from a target and treats it as a raw range. Cursorless will not use the target\'s removal delimiters, insertion delimiters, or scope type. This means deletion leaves adjacent whitespace and line endings untouched, insertion adds no automatic separator, and instance matching is not restricted to targets of the original scope type. When a raw target is the destination of a `"bring"` command, it inherits insertion delimiters from the source.',
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
      {
        command: `${REMOVE} ${VAR_SPOKEN_FORM} ${LINE}`,
        description:
          "Deletes only the line content, leaving its line ending and therefore a blank line.",
      },
      {
        command: `${PASTE} ${AFTER} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Pastes directly after the ${TARGET_DESC} without inserting a separator.`,
      },
      {
        command: `${SET_SELECTION} ${EVERY} ${INSTANCE} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects every matching text occurrence of the ${TARGET_DESC}, including occurrences that are not full tokens.`,
      },
    ],
  },
  inferPreviousMark: {
    name: "Infer previous mark",
    defaultSpokenForm: "its",
    group: { id: "inference", index: 1 },
    description:
      'Within a compound target, applies the following modifier to the previously mentioned mark. Without `"its"`, an implicit target such as `"line"` is resolved relative to the current selection instead.',
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
      {
        command: `${BRING} ${TARGET} ${TO} ${VAR_SPOKEN_FORM} ${VALUE}`,
        description: `Replaces the value containing the ${TARGET_DESC} with that token.`,
      },
    ],
  },

  // Group: private
  preferredScope: {
    name: "Preferred scope",
    private: true,
    group: { id: "private", index: 0 },
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
  modifyIfUntyped: {
    name: "Modify if untyped",
    private: true,
    group: { id: "private", index: 1 },
    syntaxes: [],
    examples: [],
  },
  fallback: {
    name: "Fallback",
    private: true,
    group: { id: "private", index: 2 },
    syntaxes: [],
    examples: [],
  },
  range: {
    name: "Range",
    private: true,
    group: { id: "private", index: 3 },
    syntaxes: [],
    examples: [],
  },
} as const satisfies Record<
  ModifierType | AdditionalModifierReferenceType,
  ReferenceEntry<ModifierReferenceGroupId>
>;
