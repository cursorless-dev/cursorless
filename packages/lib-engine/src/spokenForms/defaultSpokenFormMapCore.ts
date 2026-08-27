import {
  actionNames,
  actionReferences,
  modifierExtraReferenceIds,
  modifierExtraReferences,
  modifierReferences,
  simpleModifierReferenceIds,
  simpleScopeTypeTypes,
  scopeReferences,
} from "@cursorless/lib-common";
import type { SpokenFormReference } from "@cursorless/lib-common";
import type {
  DefaultSpokenFormMapDefinition,
  DefaultSpokenFormMapEntry,
} from "./defaultSpokenFormMap.types";
import { graphemeDefaultSpokenForms } from "./graphemes";
import { isPrivate } from "./spokenFormMapUtil";

type DefaultSpokenForm = string | DefaultSpokenFormMapEntry;

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

/**
 * This map contains the default spoken forms for all our speakable entities.
 * Actions, scopes, and modifiers are constructed from their reference
 * definitions. Paired delimiters and graphemes remain defined here until they
 * have corresponding reference definitions.
 */
export const defaultSpokenFormMapCore: DefaultSpokenFormMapDefinition = {
  pairedDelimiter: {
    curlyBrackets: "curly",
    angleBrackets: "diamond",
    escapedDoubleQuotes: "escaped quad",
    escapedSingleQuotes: "escaped twin",
    escapedParentheses: "escaped round",
    escapedSquareBrackets: "escaped box",
    doubleQuotes: "quad",
    parentheses: "round",
    backtickQuotes: "skis",
    squareBrackets: "box",
    singleQuotes: "twin",
    tripleDoubleQuotes: isPrivate("triple quad"),
    tripleSingleQuotes: isPrivate("triple twin"),
    tripleBacktickQuotes: isPrivate("triple skis"),
    any: "pair",
    string: "string",
    whitespace: "void",

    collectionBoundary: isPrivate("collection boundary"),
  },

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
