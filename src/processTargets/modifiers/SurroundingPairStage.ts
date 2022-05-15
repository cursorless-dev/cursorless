import { Selection } from "vscode";
import { SurroundingPairModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
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
export default class implements ModifierStage {
  constructor(private modifier: SurroundingPairModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const selectionWithEditor = {
      editor: target.editor,
      selection: new Selection(
        target.contentRange.start,
        target.contentRange.end
      ),
    };
    const pairs = processSurroundingPair(
      context,
      selectionWithEditor,
      this.modifier
    );
    if (pairs == null) {
      throw new Error("Couldn't find containing pair");
    }
    return pairs.map((pair) => ({
      isReversed: target.isReversed,
      editor: pair.selection.editor,
      contentRange: pair.selection.selection,
      interiorRange: pair.context.interior?.at(0)?.selection,
      removalRange: pair.context.outerSelection ?? undefined,
      delimiter: pair.context.containingListDelimiter ?? undefined,
      boundary: pair.context.boundary?.map((bound) => bound.selection),
      leadingDelimiterRange: pair.context.leadingDelimiterRange ?? undefined,
      trailingDelimiterRange: pair.context.trailingDelimiterRange ?? undefined,
    }));
  }
}
