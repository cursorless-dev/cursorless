import { DefaultSpokenFormMapEntry } from "./defaultSpokenFormMap.types";

/**
 * Used to construct entities that should not be speakable by default.
 *
 * @param spokenForms The default spoken forms for this entity
 * @returns A DefaultSpokenFormMapEntry with the given spoken forms, and
 * {@link DefaultSpokenFormMapEntry.isDisabledByDefault|isDisabledByDefault} set
 * to true
 */
export function isDisabledByDefault(
  ...spokenForms: string[]
): DefaultSpokenFormMapEntry {
  return {
    defaultSpokenForms: spokenForms,
    isDisabledByDefault: true,
    isPrivate: false,
  };
}

/**
 * Used to construct entities that are only for internal experimentation.
 *
 * @param spokenForms The default spoken forms for this entity
 * @returns A DefaultSpokenFormMapEntry with the given spoken forms, and
 * {@link DefaultSpokenFormMapEntry.isDisabledByDefault|isDisabledByDefault} and
 * {@link DefaultSpokenFormMapEntry.isPrivate|isPrivate} set to true
 */
export function isPrivate(...spokenForms: string[]): DefaultSpokenFormMapEntry {
  return {
    defaultSpokenForms: spokenForms,
    isDisabledByDefault: true,
    isPrivate: true,
  };
}
