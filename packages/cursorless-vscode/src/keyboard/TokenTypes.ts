import type {
  SimpleScopeTypeType,
  SurroundingPairName,
} from "@cursorless/common";
import type { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import type {
  PolymorphicKeyboardActionDescriptor,
  SimpleKeyboardActionDescriptor,
  SpecificKeyboardActionDescriptor,
} from "./KeyboardActionType";

/**
 * Maps from modal keyboard config section name to the type of entry expected in
 * that section.
 */
export interface SectionTypes {
  action: PolymorphicKeyboardActionDescriptor;
  color: HatColor;
  misc: MiscValue;
  specialMark: SpecialMark;
  scope: SimpleScopeTypeType;
  pairedDelimiter: SurroundingPairName;
  shape: HatShape;
  vscodeCommand: ModalVscodeCommandDescriptor;
  modifier: ModifierType;
}
type ModifierType =
  | "nextPrev"
  | "every"
  | "interiorOnly"
  | "excludeInterior"
  | "extendThroughStartOf"
  | "extendThroughEndOf";
export type MiscValue =
  | "combineColorAndShape"
  | "makeRange"
  | "makeVerticalRange"
  | "makeList"
  | "forward"
  | "backward";
export type SpecialMark = "cursor";

/**
 * Maps from token type used in parser to the type of values that the token type
 * can have. There are a few kinds of token types:
 *
 * 1. Those directly corresponding to a section in the config. These will have
 *    the same name and type as the corresponding section in
 *    {@link SectionTypes}. For example, {@link color}
 * 2. Those corresponding to subset of entries in a config section. For example,
 *    {@link simpleAction}
 * 3. Those corresponding to a single entry in a config section. These are
 *    tokens that need some special grammatical treatment. They will have a type
 *    which is a constant string equal to the key name. For example,
 *    {@link makeRange}
 * 4. Others. These are tokens that are not directly related to the config. For
 *    example, {@link digit}
 */
export interface TokenTypeValueMap {
  // tokens corresponding exactly to config sections
  simpleScopeTypeType: SimpleScopeTypeType;
  color: HatColor;
  shape: HatShape;
  vscodeCommand: ModalVscodeCommandDescriptor;
  pairedDelimiter: SurroundingPairName;

  // action config section
  simpleAction: SimpleKeyboardActionDescriptor;
  wrap: SpecificKeyboardActionDescriptor<"wrap">;

  // misc config section
  targetingMode: "makeRange" | "makeVerticalRange" | "makeList";
  combineColorAndShape: "combineColorAndShape";
  direction: "forward" | "backward";

  // modifier config section
  nextPrev: "nextPrev";
  every: "every";
  headTail: "extendThroughStartOf" | "extendThroughEndOf";
  simpleModifier: "interiorOnly" | "excludeInterior";

  // mark config section
  simpleSpecialMark: SpecialMark;

  digit: number;
}

export type ModalVscodeCommandDescriptor =
  | string
  | {
      commandId: string;
      args?: unknown[];
      executeAtTarget?: boolean;
      keepChangedSelection?: boolean;
      exitCursorlessMode?: boolean;
    };
