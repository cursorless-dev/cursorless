import {
  ModifierType,
  SimpleScopeTypeType,
  SurroundingPairName,
} from "@cursorless/common";

export type SpeakableSurroundingPairName =
  | Exclude<SurroundingPairName, "collectionBoundary">
  | "whitespace";

export type SimpleModifierType = Exclude<
  ModifierType,
  | "containingScope"
  | "ordinalScope"
  | "relativeScope"
  | "modifyIfUntyped"
  | "cascading"
  | "range"
>;

export type ModifierExtra =
  | "first"
  | "last"
  | "previous"
  | "next"
  | "forward"
  | "backward";

export interface SpokenFormMapKeyTypes {
  pairedDelimiter: SpeakableSurroundingPairName;
  simpleScopeTypeType: SimpleScopeTypeType;
  surroundingPairForceDirection: "left" | "right";
  simpleModifier: SimpleModifierType;
  modifierExtra: ModifierExtra;
  customRegex: string;
}

export type SpokenFormType = keyof SpokenFormMapKeyTypes;

export interface SpokenFormMapEntry {
  spokenForms: string[];
  isCustom: boolean;
  defaultSpokenForms: string[];
  requiresTalonUpdate: boolean;
  isSecret: boolean;
}

export type SpokenFormMap = {
  readonly [K in keyof SpokenFormMapKeyTypes]: Readonly<
    Record<SpokenFormMapKeyTypes[K], SpokenFormMapEntry>
  >;
};
