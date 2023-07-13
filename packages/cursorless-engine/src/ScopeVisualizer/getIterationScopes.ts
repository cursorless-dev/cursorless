import { Range, TextEditor, toCharacterRange } from "@cursorless/common";
import { map } from "itertools";
import { IterationScopeRanges } from "..";
import { ModifierStage } from "../processTargets/PipelineStages.types";
import { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { Target } from "../typings/target.types";
import { getTargetRanges } from "./getTargetRanges";

export function getIterationScopes(
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
        domain: toCharacterRange(scope.domain),
        ranges: scope.getTargets(false).map((target) => ({
          range: toCharacterRange(target.contentRange),
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
