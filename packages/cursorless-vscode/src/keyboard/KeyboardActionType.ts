import { ActionType, actionNames } from "@cursorless/common";

const extraKeyboardActionNames = ["wrap"] as const;
const excludedKeyboardActionNames = [
  "wrapWithPairedDelimiter",
  "wrapWithSnippet",
] as const;
const complexKeyboardActionTypes = ["wrap"] as const;

type ExtraKeyboardActionType = (typeof extraKeyboardActionNames)[number];
type ExcludedKeyboardActionType = (typeof excludedKeyboardActionNames)[number];
type ComplexKeyboardActionType = (typeof complexKeyboardActionTypes)[number];
export type SimpleKeyboardActionType = Exclude<
  KeyboardActionType,
  ComplexKeyboardActionType
>;
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
