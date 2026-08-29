import {
  actionNames,
  actionReferences,
  graphemeDefaultSpokenForms,
  modifierReferences,
  pairedDelimiterReferences,
  simpleScopeTypeTypes,
  scopeReferences,
  connectiveDefaultSpokenForms,
} from "@cursorless/lib-common";
import type {
  SpokenFormMapKeyTypes,
  SpokenFormReference,
} from "@cursorless/lib-common";
import type {
  DefaultSpokenFormMapDefinition,
  DefaultSpokenFormMapEntry,
} from "./defaultSpokenFormMap.types";

type DefaultSpokenForm = string | DefaultSpokenFormMapEntry;

const simpleModifierReferenceIds = [
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

const modifierExtraReferenceIds = [
  "first",
  "last",
  "previous",
  "next",
  "forward",
  "backward",
  "ancestor",
] as const satisfies readonly SpokenFormMapKeyTypes["modifierExtra"][];

const modifierExtraReferences = {
  first: {
    defaultSpokenForm: connectiveDefaultSpokenForms.first,
  },
  last: {
    defaultSpokenForm: connectiveDefaultSpokenForms.last,
  },
  previous: {
    defaultSpokenForm: connectiveDefaultSpokenForms.previous,
  },
  next: {
    defaultSpokenForm: connectiveDefaultSpokenForms.next,
  },
  forward: {
    defaultSpokenForm: connectiveDefaultSpokenForms.forward,
  },
  backward: {
    defaultSpokenForm: connectiveDefaultSpokenForms.backward,
  },
  ancestor: modifierReferences.ancestor,
} satisfies Record<SpokenFormMapKeyTypes["modifierExtra"], SpokenFormReference>;

function getDefaultSpokenForm(
  reference: SpokenFormReference,
): DefaultSpokenForm {
  const { defaultSpokenForm } = reference;

  if (defaultSpokenForm == null) {
    throw new Error("Reference has no default spoken form");
  }

  const isDisabledByDefault = reference.disabledByDefault ?? false;
  const isPrivate = reference.private ?? false;

  if (!isDisabledByDefault && !isPrivate) {
    return defaultSpokenForm;
  }

  return {
    defaultSpokenForms: [defaultSpokenForm],
    isDisabledByDefault,
    isPrivate,
  };
}

function getDefaultSpokenFormMap<Key extends string>(
  keys: readonly Key[],
  references: Readonly<Record<Key, SpokenFormReference>>,
): Readonly<Record<Key, DefaultSpokenForm>> {
  return Object.fromEntries(
    keys.map((key) => [key, getDefaultSpokenForm(references[key])]),
  ) as Record<Key, DefaultSpokenForm>;
}

function getCompleteDefaultSpokenFormMap<
  References extends Readonly<Record<string, SpokenFormReference>>,
>(
  references: References,
): Readonly<Record<keyof References, DefaultSpokenForm>> {
  return Object.fromEntries(
    Object.entries(references).map(([key, reference]) => [
      key,
      getDefaultSpokenForm(reference),
    ]),
  ) as Record<keyof References, DefaultSpokenForm>;
}

/**
 * This map contains the default spoken forms for all our speakable entities.
 * Actions, scopes, modifiers, and paired delimiters are constructed from their
 * reference definitions. Graphemes remain defined directly.
 */
export const defaultSpokenFormMapCore: DefaultSpokenFormMapDefinition = {
  pairedDelimiter: getCompleteDefaultSpokenFormMap(pairedDelimiterReferences),

  simpleScopeTypeType: getDefaultSpokenFormMap(
    simpleScopeTypeTypes,
    scopeReferences,
  ),
  complexScopeTypeType: {
    glyph: getDefaultSpokenForm(scopeReferences.glyph),
  },

  simpleModifier: getDefaultSpokenFormMap(
    simpleModifierReferenceIds,
    modifierReferences,
  ),
  modifierExtra: getDefaultSpokenFormMap(
    modifierExtraReferenceIds,
    modifierExtraReferences,
  ),

  customRegex: {},
  action: getDefaultSpokenFormMap(actionNames, actionReferences),
  customAction: {},
  grapheme: graphemeDefaultSpokenForms,
};
