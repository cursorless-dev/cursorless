import { range } from "lodash";
import { TokenTypeKeyMapMap } from "./TokenTypeHelpers";
import {
  getSectionKeyMap,
  getSingularSectionEntry,
} from "./sectionKeyMapExtractors";
import { simpleKeyboardActionNames } from "./KeyboardActionType";

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
export function getTokenTypeKeyMaps(): TokenTypeKeyMapMap {
  return {
    simpleScopeTypeType: getSectionKeyMap("scopes", "simpleScopeTypeType"),
    color: getSectionKeyMap("colors", "color"),
    shape: getSectionKeyMap("shapes", "shape"),
    vscodeCommand: getSectionKeyMap("vscodeCommands", "vscodeCommand"),

    // action config section
    simpleAction: getSectionKeyMap(
      "actions",
      "simpleAction",
      simpleKeyboardActionNames,
    ),

    // misc config section
    makeRange: getSingularSectionEntry("misc", "makeRange"),
    combineColorAndShape: getSingularSectionEntry(
      "misc",
      "combineColorAndShape",
    ),
    direction: getSectionKeyMap("misc", "direction", ["forward", "backward"]),

    // modifier config section
    relative: getSingularSectionEntry("modifier", "relative"),

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
