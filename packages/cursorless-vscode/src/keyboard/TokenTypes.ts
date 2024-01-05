import { SimpleScopeTypeType, SurroundingPairName } from "@cursorless/common";
import { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import { KeyboardActionDescriptor } from "./KeyboardActionType";

/**
 * Maps from modal keyboard config section name to the type of entry expected in
 * that section.
 */
export interface SectionTypes {
  action: KeyboardActionDescriptor;
  color: HatColor;
  misc: MiscValue;
  scope: SimpleScopeTypeType;
  pairedDelimiter: SurroundingPairName;
  shape: HatShape;
  vscodeCommand: ModalVscodeCommandDescriptor;
  modifier: ModifierType;
}
type ModifierType = "nextPrev" | "every";
type MiscValue =
  | "combineColorAndShape"
  | "makeRange"
  | "makeList"
  | "forward"
  | "backward";

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
  simpleAction: KeyboardActionDescriptor;
  wrap: "wrap";

  // misc config section
  makeRange: "makeRange";
  makeList: "makeList";
  combineColorAndShape: "combineColorAndShape";
  direction: "forward" | "backward";

  // modifier config section
  nextPrev: "nextPrev";
  every: "every";

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
