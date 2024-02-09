import {
  SpokenFormType,
  PartialSpokenFormTypes,
  SpokenFormMapKeyTypes,
} from "./SpokenFormType";

export interface SpokenFormMapEntry {
  /**
   * The spoken forms for this entry. These could either be a user's custom
   * spoken forms, if we have access to them, or the default spoken forms, if we
   * don't, or if we're testing.
   */
  spokenForms: string[];

  /**
   * If `true`, indicates that the user is not using the default spoken forms
   * for this entry.
   */
  isCustom: boolean;

  /**
   * The default spoken forms for this entry.
   */
  defaultSpokenForms: string[];

  /**
   * If `true`, indicates that the entry wasn't found in the user's Talon spoken
   * forms json, and so they need to update their cursorless-talon to get the
   * given entity.
   */
  requiresTalonUpdate: boolean;

  /**
   * If `true`, indicates that the entry is only for internal experimentation,
   * and should not be exposed to users except within a targeted working group.
   */
  isPrivate: boolean;
}

/**
 * A type that contains all the keys of {@link SpokenFormMapKeyTypes}, each of
 * whose values are a map from the allowed identifiers for that key to a particular
 * value type {@link T}.
 */
export type SpokenFormMappingType<T> = {
  readonly [K in SpokenFormType]: K extends PartialSpokenFormTypes
    ? Readonly<Partial<Record<SpokenFormMapKeyTypes[K], T>>>
    : Readonly<Record<SpokenFormMapKeyTypes[K], T>>;
};

/**
 * A spoken form map contains information about the spoken forms for all our
 * speakable entities, including scope types, paired delimiters, etc. It can
 * either contain the user's custom spoken forms, or the default spoken forms,
 * if we don't have access to the user's custom spoken forms, or if we're
 * testing.
 *
 * Each key of this map is a type of spoken form, eg `simpleScopeTypeType`, and
 * the value is a map of identifiers to {@link SpokenFormMapEntry}s.
 */
export type SpokenFormMap = SpokenFormMappingType<SpokenFormMapEntry>;

/**
 * Converts a spoken form map to a spoken form component map for use in spoken
 * form generation.
 * @param spokenFormMap The spoken form map to convert to a spoken form
 * component map
 * @returns A spoken form component map that can be used to generate spoken
 * forms
 */
export function mapSpokenForms<I, O>(
  input: SpokenFormMappingType<I>,
  mapper: <T extends SpokenFormType>(
    input: I,
    spokenFormType: T,
    id: SpokenFormMapKeyTypes[T],
  ) => O,
): SpokenFormMappingType<O> {
  return Object.fromEntries(
    Object.entries(input).map(([spokenFormType, map]) => [
      spokenFormType,
      Object.fromEntries(
        Object.entries(map).map(([id, inputValue]) => [
          id,
          mapper(inputValue!, spokenFormType as SpokenFormType, id),
        ]),
      ),
    ]),
    // FIXME: Don't cast here; need to make our own mapValues with stronger typing
    // using tricks from our object.d.ts
  ) as SpokenFormMappingType<O>;
}
