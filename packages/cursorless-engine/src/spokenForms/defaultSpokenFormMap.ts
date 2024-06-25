import { SpokenFormMap, mapSpokenForms } from "./SpokenFormMap";
import { defaultSpokenFormMapCore } from "./defaultSpokenFormMapCore";
import { DefaultSpokenFormInfoMap } from "./defaultSpokenFormMap.types";

/**
 * This map contains information about the default spoken forms for all our
 * speakable entities, including scope types, paired delimiters, etc. Note that
 * this map can't be used as a spoken form map. If you want something that can
 * be used as a spoken form map, see {@link defaultSpokenFormMap}.
 */
export const defaultSpokenFormInfoMap: DefaultSpokenFormInfoMap =
  mapSpokenForms(defaultSpokenFormMapCore, (value) =>
    typeof value === "string"
      ? {
          defaultSpokenForms: [value],
          isDisabledByDefault: false,
          isPrivate: false,
        }
      : value,
  );

/**
 * A spoken form map constructed from the default spoken forms. It is designed to
 * be used as a fallback when the Talon spoken form map is not available.
 */
export const defaultSpokenFormMap: SpokenFormMap = mapSpokenForms(
  defaultSpokenFormInfoMap,
  ({ defaultSpokenForms, isDisabledByDefault, isPrivate }) => ({
    spokenForms: isDisabledByDefault ? [] : defaultSpokenForms,
    isCustom: false,
    defaultSpokenForms,
    requiresTalonUpdate: false,
    isPrivate,
  }),
);
