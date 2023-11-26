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
    pairedDelimiter: getSectionKeyMap("pairedDelimiters", "pairedDelimiter"),

    // action config section
    simpleAction: getSectionKeyMap(
      "actions",
      "simpleAction",
      simpleKeyboardActionNames,
    ),
    wrap: getSingularSectionEntry("actions", "wrap"),

    // misc config section
    makeRange: getSingularSectionEntry("misc", "makeRange"),
    makeList: getSingularSectionEntry("misc", "makeList"),
    combineColorAndShape: getSingularSectionEntry(
      "misc",
      "combineColorAndShape",
    ),
    direction: getSectionKeyMap("misc", "direction", ["forward", "backward"]),

    // modifier config section
    relative: getSingularSectionEntry("modifier", "relative"),
    every: getSingularSectionEntry("modifier", "every"),

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
