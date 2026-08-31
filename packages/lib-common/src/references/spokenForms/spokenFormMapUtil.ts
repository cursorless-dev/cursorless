import type { DefaultSpokenFormMapEntry } from "../../types/DefaultSpokenFormMap";

/**
 * Used to construct entities that should not be speakable by default.
 *
 * @param spokenForms The default spoken forms for this entity
 * @returns A disabled-by-default entry with the given spoken forms
 */
export function isDisabledByDefault(
  ...spokenForms: string[]
): DefaultSpokenFormMapEntry {
  return {
    defaultSpokenForms: spokenForms,
    visibility: "disabledByDefault",
  };
}

/**
 * Used to construct entities that are only for internal experimentation.
 *
 * @param spokenForms The default spoken forms for this entity
 * @returns A private entry with the given spoken forms
 */
export function isPrivate(...spokenForms: string[]): DefaultSpokenFormMapEntry {
  return {
    defaultSpokenForms: spokenForms,
    visibility: "private",
  };
}
