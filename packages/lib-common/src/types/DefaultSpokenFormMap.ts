import type { SpokenFormMapKeyTypes } from "./SpokenFormType";
import type { SpokenFormVisibility } from "./SpokenFormVisibility";

export interface DefaultSpokenFormMapEntry {
  defaultSpokenForms: string[];
  visibility?: SpokenFormVisibility;
}

export type DefaultSpokenFormMapDefinition = {
  readonly [K in keyof SpokenFormMapKeyTypes]: Readonly<
    Record<SpokenFormMapKeyTypes[K], string | DefaultSpokenFormMapEntry>
  >;
};
