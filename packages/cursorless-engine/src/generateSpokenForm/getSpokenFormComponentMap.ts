import {
  PartialSpokenFormTypes,
  SpokenFormMap,
  SpokenFormMapKeyTypes,
  SpokenFormType,
} from "../spokenForms/SpokenFormMap";
import { CustomizableSpokenFormComponentForType } from "./SpokenFormComponent";

/**
 * A spoken form component map is a map of spoken form types to a map of IDs to
 * spoken form components. It is used to generate spoken forms. It mirrors the
 * structure of a {@link SpokenFormMap}, but instead of containing spoken form
 * map entries, it contains spoken form components for use in spoken form
 * generation.
 */
export type SpokenFormComponentMap = {
  readonly [K in SpokenFormType]: K extends PartialSpokenFormTypes
    ? Readonly<
        Partial<
          Record<
            SpokenFormMapKeyTypes[K],
            CustomizableSpokenFormComponentForType<K>
          >
        >
      >
    : Readonly<
        Record<
          SpokenFormMapKeyTypes[K],
          CustomizableSpokenFormComponentForType<K>
        >
      >;
};

/**
 * Converts a spoken form map to a spoken form component map for use in spoken
 * form generation.
 * @param spokenFormMap The spoken form map to convert to a spoken form
 * component map
 * @returns A spoken form component map that can be used to generate spoken
 * forms
 */
export function getSpokenFormComponentMap(
  spokenFormMap: SpokenFormMap,
): SpokenFormComponentMap {
  return Object.fromEntries(
    Object.entries(spokenFormMap).map(([spokenFormType, map]) => [
      spokenFormType,
      Object.fromEntries(
        Object.entries(map).map(([id, spokenForms]) => [
          id,
          {
            type: "customizable",
            spokenForms,
            spokenFormType,
            id,
          },
        ]),
      ),
    ]),
    // FIXME: Don't cast here; need to make our own mapValues with stronger typing
    // using tricks from our object.d.ts
  ) as SpokenFormComponentMap;
}
