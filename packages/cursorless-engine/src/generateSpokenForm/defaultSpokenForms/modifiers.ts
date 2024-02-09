import { CompositeKeyMap } from "@cursorless/common";
import { SpeakableSurroundingPairName } from "../../spokenForms/SpokenFormType";
import { SpokenFormComponentMap } from "../getSpokenFormComponentMap";
import { CustomizableSpokenFormComponentForType } from "../SpokenFormComponent";
import { surroundingPairsDelimiters } from "./surroundingPairsDelimiters";

const surroundingPairDelimiterToName = new CompositeKeyMap<
  [string, string],
  SpeakableSurroundingPairName
>((pair) => pair);

for (const [name, pair] of Object.entries(surroundingPairsDelimiters)) {
  if (pair != null) {
    surroundingPairDelimiterToName.set(
      pair,
      name as SpeakableSurroundingPairName,
    );
  }
}

/**
 * Given a pair of delimiters, returns the spoken form of the surrounding pair.
 * First maps from the delimiters to their identifer (eg `parentheses`), then
 * looks it up in the spoken form map.
 * @param left The left delimiter
 * @param right The right delimiter
 * @returns The spoken form of the surrounding pair
 */
export function surroundingPairDelimitersToSpokenForm(
  spokenFormMap: SpokenFormComponentMap,
  left: string,
  right: string,
): CustomizableSpokenFormComponentForType<"pairedDelimiter"> {
  const pairName = surroundingPairDelimiterToName.get([left, right]);
  if (pairName == null) {
    throw Error(`Unknown surrounding pair delimiters '${left} ${right}'`);
  }
  return spokenFormMap.pairedDelimiter[pairName];
}
