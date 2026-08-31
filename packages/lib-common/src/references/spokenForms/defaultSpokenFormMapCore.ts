import { actionNames } from "../../types/command/ActionDescriptor";
import { simpleScopeTypeTypes } from "../../types/command/PartialTargetDescriptor.types";
import type {
  DefaultSpokenFormMapDefinition,
  DefaultSpokenFormMapEntry,
} from "../../types/DefaultSpokenFormMap";
import type { SpokenFormMapKeyTypes } from "../../types/SpokenFormType";
import { actionReferences } from "../actionReferences";
import {
  modifierExtraReferences,
  modifierReferences,
} from "../modifierReferences";
import { pairedDelimiterReferences } from "../pairedDelimiterReferences";
import type { SpokenFormReference } from "../ReferenceEntry";
import { scopeReferences } from "../scopeReferences";
import {
  connectiveDefaultSpokenForms,
  insertionModeDefaultSpokenForms,
} from "./connectiveDefaultSpokenForms";
import { graphemeDefaultSpokenForms } from "./graphemeDefaultSpokenForms";
import {
  hatColorDefaultSpokenForms,
  hatShapeDefaultSpokenForms,
  lineDirectionDefaultSpokenForms,
  markDefaultSpokenForms,
  unknownSymbolMarkDefaultSpokenForm,
} from "./markDefaultSpokenForms";
import { isDisabledByDefault } from "./spokenFormMapUtil";

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

const { default: hatShapeDefault, ...hatShapes } = hatShapeDefaultSpokenForms;
const { default: hatColorDefault, ...hatColors } = hatColorDefaultSpokenForms;

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
  action: getDefaultSpokenFormMap(actionNames, actionReferences),
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
  grapheme: graphemeDefaultSpokenForms,
  insertionMode: insertionModeDefaultSpokenForms,
  hatColor: hatColors,
  hatShape: hatShapes,
  connective: {
    ...connectiveDefaultSpokenForms,
    rangeExcludingStart: isDisabledByDefault(),
  },
  specialMark: {
    currentSelection: markDefaultSpokenForms.cursor,
    previousTarget: markDefaultSpokenForms.that,
    previousSource: markDefaultSpokenForms.source,
    nothing: markDefaultSpokenForms.nothing,
    lineNumberModulo100: lineDirectionDefaultSpokenForms.modulo100,
    lineNumberRelativeUp: lineDirectionDefaultSpokenForms.relativeUp,
    lineNumberRelativeDown: lineDirectionDefaultSpokenForms.relativeDown,
    unknownSymbol: unknownSymbolMarkDefaultSpokenForm,
  },
  scopeVisualizer: {
    showScopeVisualizer: "visualize",
    hideScopeVisualizer: "visualize nothing",
    removal: "removal",
    iteration: "iteration",
  },
  sidebar: {
    bar: "bar",
  },
  customRegex: {},
  customAction: {},
};
