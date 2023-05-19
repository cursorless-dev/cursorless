import type {
  ContainingSurroundingPairModifier,
  SurroundingPairModifier,
} from "@cursorless/common";
import { LanguageDefinitions } from "../../languages/LanguageDefinitions";
import type { Target } from "../../typings/target.types";
import type { ModifierStage } from "../PipelineStages.types";
import { SurroundingPairTarget } from "../targets";
import { processSurroundingPair } from "./surroundingPair";

/**
 * Applies the surrounding pair modifier to the given selection. First looks to
 * see if the target is itself adjacent to or contained by a modifier token. If
 * so it will expand the selection to the opposite delimiter token. Otherwise,
 * or if the opposite token wasn't found, it will proceed by finding the
 * smallest pair of delimiters which contains the selection.
 *
 * @param context Context to be leveraged by modifier
 * @param selection The selection to process
 * @param modifier The surrounding pair modifier information
 * @returns The new selection expanded to the containing surrounding pair or
 * `null` if none was found
 */
export default class SurroundingPairStage implements ModifierStage {
  constructor(
    private languageDefinitions: LanguageDefinitions,
    private modifier: SurroundingPairModifier,
  ) {}

  run(target: Target): SurroundingPairTarget[] {
    if (this.modifier.type === "everyScope") {
      throw Error(`Unsupported every scope ${this.modifier.scopeType.type}`);
    }

    return processedSurroundingPairTarget(
      this.languageDefinitions,
      this.modifier,
      target,
    );
  }
}

function processedSurroundingPairTarget(
  languageDefinitions: LanguageDefinitions,
  modifier: ContainingSurroundingPairModifier,
  target: Target,
): SurroundingPairTarget[] {
  const outputTarget = processSurroundingPair(
    languageDefinitions,
    target,
    modifier.scopeType,
  );

  if (outputTarget == null) {
    throw new Error("Couldn't find containing pair");
  }

  return [outputTarget];
}
