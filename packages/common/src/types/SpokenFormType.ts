import type {
  ActionType,
  ModifierType,
  SimpleScopeTypeType,
  SurroundingPairName,
} from "@cursorless/common";

/**
 * This interface is the source of truth for the types used in our spoken form
 * map. The keys of this interface are the types of spoken forms that we
 * support, eg `simpleScopeTypeType`, `simpleModifier`, etc. The type of each
 * key is a disjunction of all identifiers that are allowed for the given type of
 * spoken form.
 */
export interface SpokenFormMapKeyTypes {
  pairedDelimiter: SpeakableSurroundingPairName;
  simpleScopeTypeType: SimpleScopeTypeType;
  complexScopeTypeType: "glyph";

  /**
   * These modifier types are spoken by directly saying the spoken form for the
   * modifier type, unlike the more complex spoken forms such as
   * `relativeScope`, which can use various different custom spoken forms such
   * as `next`, `previous`, etc.
   */
  simpleModifier: SimpleModifierType;

  /**
   * These are customizable spoken forms used in speaking modifiers, but that
   * don't directly correspond to a modifier type. For example, `next` is a
   * customizable spoken form that can be used when speaking `relativeScope`
   * modifiers, but `next` itself isn't a modifier type.
   */
  modifierExtra: ModifierExtra;
  customRegex: string;

  action: ActionType;

  /**
   * These actions correspond to id's of app commands. Eg in VSCode, you can have
   * custom actions corresponding to id's of VSCode commands.
   */
  customAction: string;

  /**
   * Individual characters / graphemes, eg `a` or `/`.
   */
  grapheme: string;
}

/**
 * These are the types of spoken forms that are not total mappings, eg if you
 * look up a string in `spokenFormMap.customRegex`, you might get `undefined`,
 * even though technically the identifier type is `string`.
 */
export type PartialSpokenFormTypes = "customRegex";

export type SpeakableSurroundingPairName = SurroundingPairName | "whitespace";

type SimpleModifierType = Exclude<
  ModifierType,
  | "containingScope"
  | "preferredScope"
  | "ordinalScope"
  | "relativeScope"
  | "modifyIfUntyped"
  | "cascading"
  | "range"
>;

type ModifierExtra =
  | "first"
  | "last"
  | "previous"
  | "next"
  | "forward"
  | "backward"
  | "ancestor";

export type SpokenFormType = keyof SpokenFormMapKeyTypes;
