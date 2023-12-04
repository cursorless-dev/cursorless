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
    simpleScopeTypeType: config.getSectionKeyMap(
      "scopes",
      "simpleScopeTypeType",
    ),
    color: config.getSectionKeyMap("colors", "color"),
    shape: config.getSectionKeyMap("shapes", "shape"),
    vscodeCommand: config.getSectionKeyMap("vscodeCommands", "vscodeCommand"),

    // action config section
    simpleAction: config.getSectionKeyMap(
      "actions",
      "simpleAction",
      simpleKeyboardActionNames,
    ),

    // misc config section
    makeRange: config.getSingularSectionEntry("misc", "makeRange"),
    combineColorAndShape: config.getSingularSectionEntry(
      "misc",
      "combineColorAndShape",
    ),
    direction: config.getSectionKeyMap("misc", "direction", [
      "forward",
      "backward",
    ]),

    // modifier config section
    nextPrev: config.getSingularSectionEntry("modifier", "nextPrev"),

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
