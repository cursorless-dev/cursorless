import { Selection } from "vscode";
import { SurroundingPairModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
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
      editor: pair.selection.editor,
      isReversed: isReversed(pair.selection.selection),
      contentRange: pair.selection.selection,
      interiorRange: pair.context.interior,
      removalRange: pair.context.removalRange,
      delimiter: pair.context.containingListDelimiter,
      boundary: pair.context.boundary,
      leadingDelimiterRange: pair.context.leadingDelimiterRange,
      trailingDelimiterRange: pair.context.trailingDelimiterRange,
    }));
  }
}
