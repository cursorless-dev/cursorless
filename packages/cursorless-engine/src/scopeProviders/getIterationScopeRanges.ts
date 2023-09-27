import { Range, TextEditor } from "@cursorless/common";
import { map } from "itertools";
import { IterationScopeRanges } from "..";
import { ModifierStage } from "../processTargets/PipelineStages.types";
import { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { Target } from "../typings/target.types";
import { getTargetRanges } from "./getTargetRanges";

/**
 * Returns a list of teration scope ranges of type {@link iterationScopeHandler}
 * within {@link iterationRange} in {@link editor}.
 * @param editor The editor to check
 * @param iterationScopeHandler The scope handler to use
 * @param everyStage An every stage for use in determining nested targets
 * @param iterationRange The range to iterate over
 * @param includeIterationNestedTargets Whether to include nested targets in the
 * iteration scope ranges
 * @returns A list of iteration scope ranges for the given editor
 */
export function getIterationScopeRanges(
  editor: TextEditor,
  iterationScopeHandler: ScopeHandler,
  everyStage: ModifierStage,
  iterationRange: Range,
  includeIterationNestedTargets: boolean,
): IterationScopeRanges[] {
  return map(
    iterationScopeHandler.generateScopes(
      editor,
      iterationRange.start,
      "forward",
      {
        includeDescendantScopes: true,
        distalPosition: iterationRange.end,
      },
    ),
    (scope) => {
      return {
        domain: scope.domain,
        ranges: scope.getTargets(false).map((target) => ({
          range: target.contentRange,
          targets: includeIterationNestedTargets
            ? getEveryScopeLenient(everyStage, target).map(getTargetRanges)
            : undefined,
        })),
      };
    },
  );
}

function getEveryScopeLenient(everyStage: ModifierStage, target: Target) {
  try {
    return everyStage.run(target);
  } catch (err) {
    if ((err as Error).name === "NoContainingScopeError") {
      return [];
    }

    throw err;
  }
}
