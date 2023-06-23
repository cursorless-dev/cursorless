import {
  IterationScopeRanges,
  Range,
  TextEditor,
  toCharacterRange,
} from "@cursorless/common";
import { map } from "itertools";
import { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { getTargetRanges } from "./getTargetRanges";
import { ModifierStage } from "../processTargets/PipelineStages.types";

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
            ? everyStage.run(target).map(getTargetRanges)
            : undefined,
        })),
      };
    },
  );
}
