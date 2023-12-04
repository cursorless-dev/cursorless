import { SimpleScopeTypeType } from "@cursorless/common";
import { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import {
  KeyboardActionType,
  SimpleKeyboardActionType,
} from "./KeyboardActionType";

/**
 * Maps from modal keyboard config section name to the type of entry expected in
 * that section.
 */
export interface SectionTypes {
  actions: KeyboardActionType;
  colors: HatColor;
  misc: MiscValue;
  scopes: SimpleScopeTypeType;
  shapes: HatShape;
  vscodeCommands: ModalVscodeCommandDescriptor;
  modifier: ModifierKeyMapValue;
}
type ModifierKeyMapValue = "nextPrev";
type MiscValue =
  | "combineColorAndShape"
  | "makeRange"
  | "makeList"
  | "forward"
  | "backward";

/**
 * Maps from token type used in parser to the type of values that the token type
 * can have. There are three kinds of token types:
 *
 * 1. Those directly corresponding to a section in the config. These will have
 *    the same type as the corresponding section in {@link SectionTypes}, but
 *    the name of the key will be singular. For example, {@link color}
 * 2. Those corresponding to a single entry in a config section. These are
 *    tokens that need some special grammatical treatment. They don't need to
 *    have a value, so we just use `undefined` as their type. For example,
 *    {@link makeRange}
 * 3. Others. These are tokens that are not directly related to the config. For
 *    example, {@link digit}
 */
export interface TokenTypeValueMap {
  // tokens corresponding exactly to config sections
  simpleScopeTypeType: SimpleScopeTypeType;
  color: HatColor;
  shape: HatShape;
  vscodeCommand: ModalVscodeCommandDescriptor;

  // action config section
  simpleAction: SimpleKeyboardActionType;

  // misc config section
  makeRange: undefined;
  combineColorAndShape: undefined;
  direction: "forward" | "backward";

  // modifier config section
  nextPrev: undefined;

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
