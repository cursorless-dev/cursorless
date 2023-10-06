import {
  SpokenFormMap,
  SpokenFormMapEntry,
  SpokenFormMapKeyTypes,
  SpokenFormType,
} from "../SpokenFormMap";

export type GeneratorSpokenFormMap = {
  readonly [K in keyof SpokenFormMapKeyTypes]: Record<
    SpokenFormMapKeyTypes[K],
    SingleTermSpokenForm
  >;
};

export interface SingleTermSpokenForm {
  type: "singleTerm";
  spokenForms: SpokenFormMapEntry;
  spokenFormType: SpokenFormType;
  id: string;
}

export type SpokenFormComponent =
  | SingleTermSpokenForm
  | string
  | SpokenFormComponent[];

export function getGeneratorSpokenForms(
  spokenFormMap: SpokenFormMap,
): GeneratorSpokenFormMap {
  // FIXME: Don't cast here; need to make our own mapValues with stronger typing
  // using tricks from our object.d.ts
  return Object.fromEntries(
    Object.entries(spokenFormMap).map(([spokenFormType, map]) => [
      spokenFormType,
      Object.fromEntries(
        Object.entries(map).map(([id, spokenForms]) => [
          id,
          {
            type: "singleTerm",
            spokenForms,
            spokenFormType,
            id,
          },
        ]),
      ),
    ]),
  ) as GeneratorSpokenFormMap;
}
