import { isString, range } from "lodash";
import {
  SimpleKeyboardActionDescriptor,
  SimpleKeyboardActionType,
  simpleKeyboardActionNames,
  PolymorphicKeyboardActionDescriptor,
  SpecificKeyboardActionDescriptor,
} from "./KeyboardActionType";
import { KeyboardConfig, only } from "./KeyboardConfig";
import { TokenTypeKeyMapMap } from "./TokenTypeHelpers";

/**
 * Returns a map from token type names to a keymap for that token type. Something like:
 *
 * ```ts
 * {
 *   action: {
 *     "c": {
 *       type: "action",
 *       value: "clearAndSetSelection",
 *     },
 *     "t": {
 *       type: "action",
 *       value: "setSelection",
 *     },
 *   },
 *   makeRange: {
 *     "r": {
 *       type: "makeRange",
 *     },
 *   },
 *   ...
 * }
 * ```
 * @returns A map from token type names to a keymap for that token type.
 */
export function getTokenTypeKeyMaps(
  config: KeyboardConfig,
): TokenTypeKeyMapMap {
  return {
    simpleScopeTypeType: config.getTokenKeyMap("simpleScopeTypeType", "scope"),
    color: config.getTokenKeyMap("color"),
    shape: config.getTokenKeyMap("shape"),
    vscodeCommand: config.getTokenKeyMap("vscodeCommand"),
    pairedDelimiter: config.getTokenKeyMap("pairedDelimiter"),

    // action config section
    simpleAction: config.getTokenKeyMap(
      "simpleAction",
      "action",
      (value: PolymorphicKeyboardActionDescriptor) => {
        if (isString(value)) {
          return simpleKeyboardActionNames.includes(
            value as SimpleKeyboardActionType,
          )
            ? {
                actionId: value as SimpleKeyboardActionType,
                exitCursorlessMode: false,
              }
            : undefined;
        }
        return simpleKeyboardActionNames.includes(
          value.actionId as SimpleKeyboardActionType,
        )
          ? (value as SimpleKeyboardActionDescriptor)
          : undefined;
      },
    ),
    wrap: config.getTokenKeyMap(
      "wrap",
      "action",
      (value: PolymorphicKeyboardActionDescriptor) => {
        if (isString(value)) {
          return value === "wrap"
            ? { actionId: value as "wrap", exitCursorlessMode: false }
            : undefined;
        }
        return value.actionId === "wrap"
          ? (value as SpecificKeyboardActionDescriptor<"wrap">)
          : undefined;
      },
    ),

    // misc config section
    makeRange: config.getTokenKeyMap("makeRange", "misc", only("makeRange")),
    makeList: config.getTokenKeyMap("makeList", "misc", only("makeList")),
    combineColorAndShape: config.getTokenKeyMap(
      "combineColorAndShape",
      "misc",
      only("combineColorAndShape"),
    ),
    direction: config.getTokenKeyMap(
      "direction",
      "misc",
      only("forward", "backward"),
    ),

    // modifier config section
    every: config.getTokenKeyMap("every", "modifier", only("every")),
    nextPrev: config.getTokenKeyMap("nextPrev", "modifier", only("nextPrev")),

    digit: Object.fromEntries(
      range(10).map((value) => [
        value.toString(),
        {
          type: "digit" as const,
          value,
        },
      ]),
    ),
  };
}
