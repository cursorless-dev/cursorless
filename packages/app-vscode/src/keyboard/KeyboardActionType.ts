import type { ActionType } from "@cursorless/lib-common";
import { actionNames } from "@cursorless/lib-common";

// This file contains types defining the allowable identifiers for actions in
// user keyboard config settings. It is a modified version of the default action
// identifiers from @cursorless/lib-common, with the addition of the "wrap" and
// "rewrap" actions that are designed to function like the "wrap" and "rewrap"
// spoken forms (ie use the same spoken form for both snippet and delimiter
// wrapping).

const extraKeyboardActionNames = ["wrap", "rewrap"] as const;
const excludedKeyboardActionNames = [
  "wrapWithPairedDelimiter",
  "rewrapWithPairedDelimiter",
  "wrapWithSnippet",
] as const;
const complexKeyboardActionTypes = ["wrap", "rewrap"] as const;

type ExtraKeyboardActionType = (typeof extraKeyboardActionNames)[number];
type ExcludedKeyboardActionType = (typeof excludedKeyboardActionNames)[number];
type ComplexKeyboardActionType = (typeof complexKeyboardActionTypes)[number];
export type SimpleKeyboardActionType = Exclude<
  KeyboardActionType,
  ComplexKeyboardActionType
>;

export type SpecificKeyboardActionDescriptor<T extends KeyboardActionType> = {
  actionId: T;
  exitCursorlessMode: boolean;
};

export type PolymorphicKeyboardActionDescriptor =
  | KeyboardActionType
  | SpecificKeyboardActionDescriptor<KeyboardActionType>;

export type SimpleKeyboardActionDescriptor =
  SpecificKeyboardActionDescriptor<SimpleKeyboardActionType>;

export type KeyboardActionType =
  | Exclude<ActionType, ExcludedKeyboardActionType>
  | ExtraKeyboardActionType;

const keyboardActionNames: KeyboardActionType[] = [
  ...actionNames.filter(
    (
      actionName,
    ): actionName is Exclude<KeyboardActionType, ExtraKeyboardActionType> =>
      !excludedKeyboardActionNames.includes(actionName as any),
  ),
  ...extraKeyboardActionNames,
];

export const simpleKeyboardActionNames = keyboardActionNames.filter(
  (actionName): actionName is SimpleKeyboardActionType =>
    !complexKeyboardActionTypes.includes(
      actionName as ComplexKeyboardActionType,
    ),
);
