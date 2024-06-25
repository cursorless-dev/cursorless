import { SpokenFormMappingType } from "./SpokenFormMap";
import { SpokenFormMapKeyTypes } from "./SpokenFormType";

export type DefaultSpokenFormMapDefinition = {
  readonly [K in keyof SpokenFormMapKeyTypes]: Readonly<
    Record<SpokenFormMapKeyTypes[K], string | DefaultSpokenFormMapEntry>
  >;
};

export interface DefaultSpokenFormMapEntry {
  defaultSpokenForms: string[];

  /**
   * If `true`, indicates that the entry may have a default spoken form, but
   * it should not be enabled by default. These will show up in user csv's with
   * a `-` at the beginning.
   */
  isDisabledByDefault: boolean;

  /**
   * If `true`, indicates that the entry is only for internal experimentation,
   * and should not be exposed to users except within a targeted working group.
   */
  isPrivate: boolean;
}

export type DefaultSpokenFormInfoMap =
  SpokenFormMappingType<DefaultSpokenFormMapEntry>;
