import { range } from "lodash";
import { TokenTypeKeyMapMap } from "./TokenTypeHelpers";
import { simpleKeyboardActionNames } from "./KeyboardActionType";
import { KeyboardConfig } from "./KeyboardConfig";

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
      simpleKeyboardActionNames,
    ),
    wrap: config.getTokenKeyMap("wrap", "action", ["wrap"]),

    // misc config section
    makeRange: config.getTokenKeyMap("makeRange", "misc", ["makeRange"]),
    makeList: config.getTokenKeyMap("makeList", "misc", ["makeList"]),
    combineColorAndShape: config.getTokenKeyMap(
      "combineColorAndShape",
      "misc",
      ["combineColorAndShape"],
    ),
    direction: config.getTokenKeyMap("direction", "misc", [
      "forward",
      "backward",
    ]),

    // modifier config section
    every: config.getTokenKeyMap("every", "modifier", ["every"]),
    nextPrev: config.getTokenKeyMap("nextPrev", "modifier", ["nextPrev"]),

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
